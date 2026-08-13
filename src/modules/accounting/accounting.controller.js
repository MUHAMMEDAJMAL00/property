const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const { accountService, journalService, ledgerService, expenseService } = require('./accounting.service');

const accountingController = {
  listAccounts: catchAsync(async (req, res) => {
    const data = await accountService.list(req.query);
    res.json(ApiResponse.success('Accounts fetched', data));
  }),

  createAccount: catchAsync(async (req, res) => {
    const data = await accountService.create(req.body);
    res.status(201).json(ApiResponse.success('Account created', data));
  }),

  listJournals: catchAsync(async (req, res) => {
    const data = await journalService.list(req.query);
    res.json(ApiResponse.success('Journals fetched', data));
  }),

  postJournal: catchAsync(async (req, res) => {
    const data = await journalService.post(req.body, req.user);
    res.status(201).json(ApiResponse.success('Journal posted', data));
  }),

  getJournal: catchAsync(async (req, res) => {
    const data = await journalService.getById(req.params.id);
    res.json(ApiResponse.success('Journal fetched', data));
  }),

  getLedger: catchAsync(async (req, res) => {
    const data = await ledgerService.list(req.query);
    res.json(ApiResponse.success('Ledger fetched', data));
  }),

  getTrialBalance: catchAsync(async (req, res) => {
    const data = await ledgerService.trialBalance();
    res.json(ApiResponse.success('Trial balance fetched', data));
  }),

  listExpenses: catchAsync(async (req, res) => {
    const data = await expenseService.list(req.query);
    res.json(ApiResponse.success('Expenses fetched', data));
  }),

  createExpense: catchAsync(async (req, res) => {
    const data = await expenseService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Expense created', data));
  }),

  changeExpenseStatus: catchAsync(async (req, res) => {
    const data = await expenseService.changeStatus(req.params.id, req.body.status, req.user);
    res.json(ApiResponse.success('Expense status updated', data));
  }),
};

module.exports = accountingController;