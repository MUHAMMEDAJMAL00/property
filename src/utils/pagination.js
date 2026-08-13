const getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const getPagingData = ({ count, rows }, page, limit) => ({
  items: rows,
  pagination: {
    page,
    limit,
    totalItems: count,
    totalPages: Math.ceil(count / limit),
  },
});

module.exports = { getPagination, getPagingData };