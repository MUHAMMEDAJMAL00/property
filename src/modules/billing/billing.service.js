const { Op } = require('sequelize');
const { Invoice, InvoiceItem, Payment, AdditionalCharge, INVOICE_STATUS } = require('./billing.model');
const { Booking } = require('../booking/booking.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { generateSequenceNumber, toDecimal } = require('../../utils/helpers');

const INVOICE_INCLUDES = [
  { association: 'booking' },
  { association: 'guest' },
  { association: 'items' },
  { association: 'payments' },
];

const billingService = {
  async listInvoices(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.from_date) where.invoice_date = { [Op.gte]: query.from_date };
    if (query.to_date) where[Op.or] = where[Op.or] || [];
    if (query.from_date && query.to_date) where.invoice_date = { [Op.between]: [query.from_date, query.to_date] };

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [{ association: 'guest' }, { association: 'booking' }],
      distinct: true,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    return getPagingData({ count, rows }, page, limit);
  },

  async getInvoice(id) {
    const invoice = await Invoice.findByPk(id, { include: INVOICE_INCLUDES });
    if (!invoice) throw ApiError.notFound('Invoice not found');
    return invoice;
  },

  async createFromBooking(bookingId, user) {
    const booking = await Booking.findByPk(bookingId, { include: ['guest'] });
    if (!booking) throw ApiError.notFound('Booking not found');
    if (!booking.guest_id) throw ApiError.badRequest('Booking has no guest');

    const existing = await Invoice.findOne({ where: { booking_id: bookingId } });
    if (existing) throw ApiError.conflict('An invoice already exists for this booking');

    const count = await Invoice.count();
    const invoiceNumber = generateSequenceNumber('INV', count);

    const invoice = await Invoice.create({
      invoice_number: invoiceNumber,
      booking_id: booking.booking_id,
      guest_id: booking.guest_id,
      invoice_date: new Date().toISOString().slice(0, 10),
      subtotal: booking.rate,
      tax_amount: booking.tax_amount,
      discount_amount: booking.discount_amount,
      total_amount: booking.total_amount,
      status: INVOICE_STATUS.ISSUED,
      created_by: user ? user.user_id : null,
    });

    await InvoiceItem.create({
      invoice_id: invoice.invoice_id,
      description: `Stay charges for booking ${booking.booking_number} (${booking.check_in_date} to ${booking.check_out_date})`,
      item_type: 'room_charge',
      quantity: 1,
      unit_price: booking.rate,
      amount: booking.rate,
      tax_amount: booking.tax_amount,
    });

    const additional = await AdditionalCharge.findAll({ where: { booking_id: bookingId, status: 'approved' } });
    for (const charge of additional) {
      await InvoiceItem.create({
        invoice_id: invoice.invoice_id,
        description: charge.description,
        item_type: charge.charge_type === 'other' ? 'other' : charge.charge_type,
        quantity: 1,
        unit_price: charge.amount,
        amount: charge.amount,
        tax_amount: charge.tax_amount,
      });
      await charge.update({ status: 'charged' });
    }
    if (additional.length) {
      const extra = additional.reduce((sum, c) => sum + Number(c.amount), 0);
      const extraTax = additional.reduce((sum, c) => sum + Number(c.tax_amount), 0);
      const totals = {
        subtotal: toDecimal(Number(invoice.subtotal) + extra),
        tax_amount: toDecimal(Number(invoice.tax_amount) + extraTax),
        total_amount: toDecimal(Number(invoice.total_amount) + extra + extraTax),
      };
      await invoice.update(totals);
      invoice.set(totals);
    }

    return this.getInvoice(invoice.invoice_id);
  },

  async addAdditionalCharge(bookingId, data, user) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    return AdditionalCharge.create({
      ...data,
      booking_id: bookingId,
      created_by: user ? user.user_id : null,
    });
  },

  async listAdditionalCharges(bookingId) {
    return AdditionalCharge.findAll({
      where: { booking_id: bookingId },
      order: [['created_at', 'DESC']],
    });
  },

  async approveCharge(chargeId, status, user) {
    const charge = await AdditionalCharge.findByPk(chargeId);
    if (!charge) throw ApiError.notFound('Additional charge not found');
    await charge.update({ status, updated_by: user ? user.user_id : null });
    return charge;
  },

  async recordPayment(invoiceId, data, user) {
    const invoice = await this.getInvoice(invoiceId);
    if (invoice.status === INVOICE_STATUS.VOID) throw ApiError.badRequest('Cannot pay a void invoice');

    const amount = Number(data.amount);
    const outstanding = toDecimal(Number(invoice.total_amount) - Number(invoice.paid_amount));
    if (amount <= 0) throw ApiError.badRequest('Payment amount must be positive');
    if (amount > outstanding) throw ApiError.badRequest(`Payment exceeds outstanding balance of ${outstanding}`);

    await Payment.create({
      invoice_id: invoice.invoice_id,
      amount,
      payment_mode: data.payment_mode || 'cash',
      reference_number: data.reference_number || null,
      paid_at: data.paid_at || new Date(),
      received_by: user ? user.user_id : null,
      notes: data.notes || null,
      created_by: user ? user.user_id : null,
    });

    const paidAmount = toDecimal(Number(invoice.paid_amount) + amount);
    const newStatus = paidAmount >= Number(invoice.total_amount) ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIALLY_PAID;
    await invoice.update({ paid_amount: paidAmount, status: newStatus, updated_by: user ? user.user_id : null });

    await Booking.update({ payment_status: paidAmount >= Number(invoice.total_amount) ? 'paid' : 'partial' }, { where: { booking_id: invoice.booking_id } });

    return this.getInvoice(invoice.invoice_id);
  },

  async voidInvoice(id, user) {
    const invoice = await this.getInvoice(id);
    await invoice.update({ status: INVOICE_STATUS.VOID, updated_by: user ? user.user_id : null });
    return this.getInvoice(id);
  },

  async markCharged(chargeId, user) {
    return this.approveCharge(chargeId, 'charged', user);
  },
};

module.exports = billingService;