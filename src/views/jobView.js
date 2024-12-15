exports.successResponse = (res, data, message = '요청 성공') => {
  res.status(200).json({
    success: true,
    message,
    data,
  });
};

exports.errorResponse = (res, error, message = '요청 실패') => {
  res.status(400).json({
    success: false,
    message,
    error,
  });
};
