const mongoose = require('mongoose');

/**
 * JobReview 스키마
 * @typedef {Object} JobReview
 * @property {mongoose.Schema.Types.ObjectId} job_id - 리뷰가 작성된 공고 ID (Job 모델 참조)
 * @property {mongoose.Schema.Types.ObjectId} user_id - 리뷰를 작성한 사용자 ID (User 모델 참조)
 * @property {Number} rating - 리뷰 평점 (1 ~ 5 사이)
 * @property {String} comment - 리뷰 내용 (선택사항)
 * @property {Date} reviewed_at - 리뷰 작성일
 */
const JobReviewSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', // 공고 ID 참조
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 리뷰를 작성한 사용자 참조
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, // 평점은 1 ~ 5 사이
  },
  comment: {
    type: String,
    trim: true,
    required: false, // 리뷰 내용은 선택사항
  },
  reviewed_at: {
    type: Date,
    default: Date.now, // 기본값: 현재 시간
  },
});

// JobReview 모델 생성
const JobReview = mongoose.model('JobReview', JobReviewSchema);

module.exports = JobReview;
