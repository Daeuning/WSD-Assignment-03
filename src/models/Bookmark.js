const mongoose = require('mongoose');

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
