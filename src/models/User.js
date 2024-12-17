const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // 중복 방지
      trim: true,
    },
    password: {
      type: String,
      required: true, // 해시된 비밀번호 저장
    },
    bio: {
      type: String,
      trim: true,
      default: '', // 간단한 자기소개
    },
    login_history: [
      {
        logged_in_at: { type: Date, default: Date.now }, // 로그인 시간
        ip_address: { type: String, default: '' },       // 로그인 IP
      },
    ],
    apply_history: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // 지원한 공고 ID 참조
    ],
    bookmark: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // 북마크한 공고 ID 참조
    ],
    search_history: [
      {
        keyword: { type: String, trim: true },         // 검색어
        searched_at: { type: Date, default: Date.now }, // 검색 시간
      },
    ],
    refresh_token: {
      type: String, // 암호화된 리프레시 토큰
    },
  },
);

module.exports = mongoose.model('User', userSchema);
