const mongoose = require('mongoose');

/**
 * Favorite 스키마
 * @typedef {Object} Favorite
 * @property {mongoose.Schema.Types.ObjectId} user_id - 사용자 ID (User 모델 참조)
 * @property {Array<Object>} jobs - 관심 공고 배열
 * @property {Object} jobs.job_info - 관심 공고의 세부 정보
 * @property {mongoose.Schema.Types.ObjectId} jobs.job_info.job_id - 관심 등록된 공고 ID (Job 모델 참조)
 * @property {Date} jobs.job_info.created_at - 관심 등록 날짜 (기본값: 현재 시간)
 */
const FavoriteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 사용자 참조
    required: true,
  },
  jobs: [
    {
      job_info: {
        job_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Job', // 공고 참조
          required: true,
        },
        created_at: {
          type: Date,
          default: Date.now, // 관심 공고 추가 날짜
        },
      },
    },
  ],
});

FavoriteSchema.index({ user_id: 1 }, { unique: true }); // 사용자당 하나의 관심 공고 목록만 생성

const Favorite = mongoose.model('Favorite', FavoriteSchema);

module.exports = Favorite;
