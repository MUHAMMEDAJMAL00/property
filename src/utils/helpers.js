const generateSequenceNumber = (prefix, count) => {
  const date = new Date();
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}-${yymm}-${seq}`;
};

const toDecimal = (value) => Math.round(Number(value || 0) * 100) / 100;

module.exports = { generateSequenceNumber, toDecimal };