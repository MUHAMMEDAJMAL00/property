const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const billingController = require('./billing.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/invoices')
  .get(authorize(), billingController.listInvoices);

router.post('/invoices/create', authorize('super_admin', 'front_office', 'accounts'), billingController.createInvoiceFromBooking);

router
  .route('/invoices/:id')
  .get(authorize(), billingController.getInvoice)
  .post(authorize('super_admin', 'front_office', 'accounts'), billingController.recordPayment)
  .delete(authorize('super_admin', 'accounts'), billingController.voidInvoice);

router.get('/bookings/:bookingId/charges', authorize(), billingController.listAdditionalCharges);
router.post('/charges', authorize('super_admin', 'front_office', 'accounts'), billingController.addAdditionalCharge);
router.patch('/charges/:id', authorize('super_admin', 'accounts'), billingController.updateChargeStatus);

module.exports = router;