/**
 * 성공 응답 처리
 * @param {Object} res - Express 응답 객체
 * @param {Object} data - 반환할 데이터
 * @param {string} [message='요청 성공'] - 성공 메시지
 * @param {number} [statusCode=200] - HTTP 상태 코드
 */
exports.successResponse = (res, data, message = '요청 성공', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(), // 응답 생성 시간
    },
  });
};

/**
 * 에러 응답 처리
 * @param {Object} res - Express 응답 객체
 * @param {string|Object} error - 오류 상세 정보
 * @param {string} [message='요청 실패'] - 에러 메시지
 * @param {number} [statusCode=400] - HTTP 상태 코드
 */
exports.errorResponse = (res, error, message = '요청 실패', statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: typeof error === 'object' ? error.message || error : error,
    meta: {
      timestamp: new Date().toISOString(), // 응답 생성 시간
    },
  });
};
