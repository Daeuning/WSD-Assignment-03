exports.successResponse = (res, data, message) => {
  res.status(200).json({
    success: true,
    message,
    data,
  });
};

exports.errorResponse = (res, error, message) => {
  res.status(500).json({
    success: false,
    message,
    error,
  });
};
