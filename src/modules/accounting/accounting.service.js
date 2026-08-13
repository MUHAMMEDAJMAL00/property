const { Op } = require('sequelize');
const { ChartOfAccount, Journal, JournalEntry, Ledger, Expense } = require('./accounting.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { generateSequenceNumber, toDecimal } = require('../../utils/helpers');

const accountService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.account_type) where.account_type = query.account_type;
    if (query.search) where.account_name = { [Op.like]: `%${query.search}%` };
    const { count, rows } = await ChartOfAccount.findAndCountAll({ where, distinct: true, limit, offset, order: [['account_code', 'ASC']] });
    return getPagingData({ count, rows }, page, limit);
  },

  async create(data) {
    return ChartOfAccount.create(data);
  },
};

const journalService = {
  async post(data, user) {
    const { journal_date, memo, entries } = data;
    if (!journal_date || !entries || entries.length < 2) {
      throw ApiError.badRequest('A journal requires a date and at least two entries (debit and credit)');
    }

    let totalDebit = 0;
    let totalCredit = 0;
    for (const entry of entries) {
      const debit = Number(entry.debit_amount || 0);
      const credit = Number(entry.credit_amount || 0);
      if (debit === 0 && credit === 0) throw ApiError.badRequest('Each entry must have a debit or credit amount');
      if (debit > 0 && credit > 0) throw ApiError.badRequest('An entry cannot be both debit and credit');
      totalDebit += debit;
      totalCredit += credit;
    }
    if (toDecimal(totalDebit) !== toDecimal(totalCredit)) {
      throw ApiError.badRequest(`Journal is not balanced: debit ${totalDebit} != credit ${totalCredit}`);
    }

    const count = await Journal.count();
    const journalNumber = generateSequenceNumber('JRN', count);

    const result = await Journal.sequelize.transaction(async (t) => {
      const journal = await Journal.create(
        { journal_number: journalNumber, journal_date, memo, status: 'posted', posted_by: user ? user.user_id : null, posted_at: new Date(), created_by: user ? user.user_id : null },
        { transaction: t }
      );

      for (const entry of entries) {
        const account = await ChartOfAccount.findByPk(entry.account_id, { transaction: t });
        if (!account) throw ApiError.badRequest(`Account ${entry.account_id} does not exist`);

        await JournalEntry.create(
          { journal_id: journal.journal_id, account_id: entry.account_id, debit_amount: entry.debit_amount || 0, credit_amount: entry.credit_amount || 0, description: entry.description || memo },
          { transaction: t }
        );

        const last = await Ledger.findOne({ where: { account_id: entry.account_id }, order: [['created_at', 'DESC'], ['ledger_id', 'DESC']], transaction: t });
        const previousBalance = last ? Number(last.balance) : Number(account.opening_balance);
        const balance = toDecimal(previousBalance + Number(entry.debit_amount) - Number(entry.credit_amount));

        await Ledger.create(
          {
            account_id: entry.account_id,
            entry_date: journal_date,
            description: memo,
            debit_amount: entry.debit_amount || 0,
            credit_amount: entry.credit_amount || 0,
            balance,
            reference_type: 'journal',
            reference_id: journal.journal_id,
            created_by: user ? user.user_id : null,
          },
          { transaction: t }
        );
      }

      return journal;
    });

    return journalService.getById(result.journal_id);
  },

  async getById(id) {
    const journal = await Journal.findByPk(id, { include: [{ association: 'entries', include: ['account'] }] });
    if (!journal) throw ApiError.notFound('Journal not found');
    return journal;
  },

  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.from_date && query.to_date) where.journal_date = { [Op.between]: [query.from_date, query.to_date] };
    const { count, rows } = await Journal.findAndCountAll({ where, distinct: true, limit, offset, order: [['journal_date', 'DESC']] });
    return getPagingData({ count, rows }, page, limit);
  },
};

const ledgerService = {
  async list(query) {
    const { account_id: accountId, from_date: fromDate, to_date: toDate } = query;
    if (!accountId) throw ApiError.badRequest('account_id is required');
    const where = { account_id: accountId };
    if (fromDate && toDate) where.entry_date = { [Op.between]: [fromDate, toDate] };

    const { page, limit, offset } = getPagination(query);
    const { count, rows } = await Ledger.findAndCountAll({
      where,
      include: [{ association: 'account' }],
      distinct: true,
      limit,
      offset,
      order: [['entry_date', 'ASC'], ['ledger_id', 'ASC']],
    });
    return getPagingData({ count, rows }, page, limit);
  },

  async trialBalance() {
    const accounts = await ChartOfAccount.findAll({
      include: [{ association: 'ledgerEntries', attributes: ['debit_amount', 'credit_amount'] }],
    });
    return accounts.map((acc) => {
      const totalDebit = acc.ledgerEntries.reduce((sum, e) => sum + Number(e.debit_amount), 0);
      const totalCredit = acc.ledgerEntries.reduce((sum, e) => sum + Number(e.credit_amount), 0);
      return {
        account_id: acc.account_id,
        account_code: acc.account_code,
        account_name: acc.account_name,
        account_type: acc.account_type,
        opening_balance: Number(acc.opening_balance),
        total_debit: toDecimal(totalDebit),
        total_credit: toDecimal(totalCredit),
        balance: toDecimal(Number(acc.opening_balance) + totalDebit - totalCredit),
      };
    });
  },
};

const expenseService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.from_date && query.to_date) where.expense_date = { [Op.between]: [query.from_date, query.to_date] };
    const { count, rows } = await Expense.findAndCountAll({ where, distinct: true, limit, offset, order: [['expense_date', 'DESC']] });
    return getPagingData({ count, rows }, page, limit);
  },

  async create(data, user) {
    const totalAmount = toDecimal(Number(data.amount) + Number(data.tax_amount || 0));
    return Expense.create({ ...data, total_amount: data.total_amount || totalAmount, created_by: user ? user.user_id : null });
  },

  async changeStatus(id, status, user) {
    const expense = await Expense.findByPk(id);
    if (!expense) throw ApiError.notFound('Expense not found');
    await expense.update({ status, approved_by: user ? user.user_id : null, updated_by: user ? user.user_id : null });
    return expense;
  },
};

module.exports = { accountService, journalService, ledgerService, expenseService };