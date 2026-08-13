class ApiError extends Error {
  constructor(statusCode, message, code = 'APP_ERROR', details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    if (details !== undefined) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message) {
    return new ApiError(409, message, 'CONFLICT');
  }
}

module.exports = ApiError;