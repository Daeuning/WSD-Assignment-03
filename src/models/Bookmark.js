const mongoose = require('mongoose');

/**
 * Bookmark 스키마
 * @typedef {Object} Bookmark
 * @property {mongoose.Schema.Types.ObjectId} user_id - 북마크를 생성한 사용자 ID
 * @property {Array<Object>} jobs - 사용자가 북마크한 공고 목록
 * @property {Object} jobs.job_info - 북마크된 공고에 대한 정보
 * @property {mongoose.Schema.Types.ObjectId} jobs.job_info.job_id - 북마크된 공고 ID
 * @property {Date} jobs.job_info.created_at - 북마크가 생성된 시간
 */
const BookmarkSchema = new mongoose.Schema({
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
          default: Date.now, // 북마크 추가 날짜
        },
      },
    },
  ],
});

BookmarkSchema.index({ user_id: 1 }, { unique: true }); // 사용자당 하나의 북마크 목록만 생성

const Bookmark = mongoose.model('Bookmark', BookmarkSchema);

module.exports = Bookmark;
