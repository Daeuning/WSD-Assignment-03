const mongoose = require('mongoose');
const SearchHistory = require('../models/SearchHistory');
const { successResponse, errorResponse } = require('../views/searchView');

// 상위 3개 검색 키워드 반환
/**
 * @function getTopSearchKeywords
 * @description 특정 사용자의 상위 3개 검색 키워드를 반환합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} req.user - JWT 미들웨어를 통해 전달된 사용자 정보
 * @param {Object} req.user.userId - 사용자 ID
 * @param {Object} res - 응답 객체
 * @returns {void}
 * @throws {Error} - 예외 발생 시 에러 메시지와 함께 실패 응답 반환
 */
exports.getTopSearchKeywords = async (req, res) => {
  try {
    const userId = req.user.userId; // JWT 미들웨어에서 전달된 userId

    if (!userId) {
      return res.status(400).json({ success: false, message: '사용자 ID가 필요합니다.' });
    }

    // 상위 3개 키워드 집계
    const topKeywords = await SearchHistory.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } }, // 사용자 ID 기준 필터링
      { $sort: { search_count: -1, created_at: -1 } }, // 검색 횟수 및 최신순 정렬
      { $limit: 3 }, // 상위 3개만 가져오기
      { $project: { search_keyword: 1, search_count: 1, _id: 0 } }, // 필요한 필드만 반환
    ]);

    // 응답 반환
    successResponse(res, topKeywords, '상위 3개 검색 키워드 조회 성공');
  } catch (error) {
    console.error('❌ 상위 검색 키워드 조회 실패:', error.message);
    errorResponse(res, error.message, '상위 검색 키워드 조회 실패');
  }
};
