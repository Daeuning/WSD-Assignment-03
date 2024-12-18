const mongoose = require('mongoose');

/**
 * User 스키마
 * @typedef {Object} User
 * @property {String} email - 사용자 이메일 (고유값, 필수)
 * @property {String} password - 사용자 비밀번호 (필수)
 * @property {String} bio - 사용자 소개 (선택, 기본값: 빈 문자열)
 * @property {String} refresh_token - 리프레시 토큰 (선택, 기본값: 빈 문자열)
 * @property {Array<Object>} login_history - 로그인 기록 배열
 * @property {Date} login_history.logged_in_at - 로그인 시간
 * @property {String} login_history.ip_address - 로그인 IP 주소
 */
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  bio: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  refresh_token: { 
    type: String, 
    default: '' // 리프레시 토큰 저장
  },
  login_history: [
    {
      logged_in_at: { type: Date, default: Date.now }, // 로그인 시간
      ip_address: { type: String, default: '' }       // 로그인 IP
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
