const mongoose = require('mongoose');

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
