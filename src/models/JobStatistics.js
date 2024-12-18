const mongoose = require('mongoose');

/**
 * JobStatistics 스키마
 * @typedef {Object} JobStatistics
 * @property {mongoose.Schema.Types.ObjectId} job_id - 통계가 연결된 공고 ID (Job 모델 참조)
 * @property {Number} views - 조회 수
 * @property {Number} applications - 지원자 수
 * @property {Number} bookmark_count - 북마크 수
 * @property {Number} favorite_count - 관심 공고 수
 */
const JobStatisticsSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', // Job 모델 참조
    required: true,
    unique: true // 각 공고당 하나의 통계만 저장되도록 설정
  },
  views: {
    type: Number,
    default: 0, // 초기 조회 수는 0
    min: 0
  },
  applications: {
    type: Number,
    default: 0, // 초기 지원자 수는 0
    min: 0
  },
  bookmark_count: {
    type: Number,
    default: 0, // 초기 북마크 수는 0
    min: 0
  },
  favorite_count: {
    type: Number,
    default: 0, // 초기 관심 공고 수는 0
    min: 0
  }
});

// JobStatistics 모델 생성
const JobStatistics = mongoose.model('JobStatistics', JobStatisticsSchema);

module.exports = JobStatistics;
