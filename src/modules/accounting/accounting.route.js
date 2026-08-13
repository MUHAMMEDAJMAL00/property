const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const accountingController = require('./accounting.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/accounts')
  .get(authorize(), accountingController.listAccounts)
  .post(authorize('super_admin', 'accounts'), accountingController.createAccount);

router
  .route('/journals')
  .get(authorize(), accountingController.listJournals)
  .post(authorize('super_admin', 'accounts'), accountingController.postJournal);

router.get('/journals/:id', authorize(), accountingController.getJournal);

router.get('/ledger', authorize(), accountingController.getLedger);
router.get('/trial-balance', authorize(), accountingController.getTrialBalance);

router
  .route('/expenses')
  .get(authorize(), accountingController.listExpenses)
  .post(authorize('super_admin', 'accounts'), accountingController.createExpense);

router.patch('/expenses/:id/status', authorize('super_admin', 'accounts'), accountingController.changeExpenseStatus);

module.exports = router;