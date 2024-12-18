const mongoose = require('mongoose');

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
