const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const billingService = require('./billing.service');

const billingController = {
  listInvoices: catchAsync(async (req, res) => {
    const data = await billingService.listInvoices(req.query);
    res.json(ApiResponse.success('Invoices fetched', data));
  }),

  getInvoice: catchAsync(async (req, res) => {
    const data = await billingService.getInvoice(req.params.id);
    res.json(ApiResponse.success('Invoice fetched', data));
  }),

  createInvoiceFromBooking: catchAsync(async (req, res) => {
    const data = await billingService.createFromBooking(req.body.booking_id, req.user);
    res.status(201).json(ApiResponse.success('Invoice created', data));
  }),

  recordPayment: catchAsync(async (req, res) => {
    const data = await billingService.recordPayment(req.params.id, req.body, req.user);
    res.status(201).json(ApiResponse.success('Payment recorded', data));
  }),

  voidInvoice: catchAsync(async (req, res) => {
    const data = await billingService.voidInvoice(req.params.id, req.user);
    res.json(ApiResponse.success('Invoice voided', data));
  }),

  addAdditionalCharge: catchAsync(async (req, res) => {
    const data = await billingService.addAdditionalCharge(req.body.booking_id, req.body, req.user);
    res.status(201).json(ApiResponse.success('Additional charge added', data));
  }),

  listAdditionalCharges: catchAsync(async (req, res) => {
    const data = await billingService.listAdditionalCharges(req.params.bookingId);
    res.json(ApiResponse.success('Additional charges fetched', data));
  }),

  updateChargeStatus: catchAsync(async (req, res) => {
    const data = await billingService.approveCharge(req.params.id, req.body.status, req.user);
    res.json(ApiResponse.success('Charge status updated', data));
  }),
};

module.exports = billingController;