// errorHandler.js
const { CustomError } = require('./error');
const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  // 커스텀 에러 처리
  if (err instanceof CustomError) {
    logger.error({
      message: err.message,
      statusCode: err.statusCode,
      details: err.details,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }), // 추가적인 에러 정보
    });
  }

  // 예상치 못한 에러 처리
  logger.error({
    message: 'Unexpected Error',
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};

module.exports = errorHandler;
