// errors.js
class CustomError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details; // 추가적인 에러 정보를 포함할 수 있음
  }
}

class ValidationError extends CustomError {
  constructor(message, details = null) {
    super(message, 400, details); // HTTP 400 Bad Request
  }
}

class AuthenticationError extends CustomError {
  constructor(message, details = null) {
    super(message, 401, details); // HTTP 401 Unauthorized
  }
}

class ForbiddenError extends CustomError {
  constructor(message, details = null) {
    super(message, 403, details); // HTTP 403 Forbidden
  }
}

class NotFoundError extends CustomError {
  constructor(message, details = null) {
    super(message, 404, details); // HTTP 404 Not Found
  }
}

class InternalServerError extends CustomError {
  constructor(message, details = null) {
    super(message, 500, details); // HTTP 500 Internal Server Error
  }
}

module.exports = {
  CustomError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
};
