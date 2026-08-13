const ApiError = require('../utils/ApiError');

const mapSequelizeError = (error) => {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return new ApiError(409, 'A record with the same unique value already exists', 'DUPLICATE', error.errors);
  }
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map((e) => e.message);
    return new ApiError(400, messages.join(', '), 'VALIDATION_ERROR', messages);
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new ApiError(400, 'Related record does not exist', 'FK_CONSTRAINT');
  }
  return null;
};

const errorHandler = (error, req, res, next) => {
  let err = error;

  if (!(err instanceof ApiError)) {
    const mapped = mapSequelizeError(err);
    err = mapped || new ApiError(500, 'Internal server error');
  }

  if (err.statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    code: err.code,
    ...(err.details !== undefined ? { details: err.details } : {}),
    ...(process.env.NODE_ENV === 'development' && err.statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;