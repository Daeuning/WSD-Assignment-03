const mongoose = require('mongoose');

/**
 * SearchHistory 스키마
 * @typedef {Object} SearchHistory
 * @property {mongoose.Schema.Types.ObjectId} user_id - 검색 기록을 남긴 사용자 ID (User 모델 참조)
 * @property {String} search_keyword - 검색어
 * @property {Number} search_count - 동일 검색어 검색 횟수
 * @property {Date} created_at - 검색 기록 생성 날짜 및 시간
 */
const SearchHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 사용자 컬렉션과 참조 연결
    required: true,
  },
  search_keyword: {
    type: String,
    required: true,
    trim: true,
  },
  search_count: {
    type: Number,
    default: 1,
    min: 1, // 검색 횟수는 최소 1
  },
  created_at: {
    type: Date,
    default: Date.now, // 기본값: 현재 날짜 및 시간
  },
});

// SearchHistory 모델 생성
const SearchHistory = mongoose.model('SearchHistory', SearchHistorySchema);

module.exports = SearchHistory;
