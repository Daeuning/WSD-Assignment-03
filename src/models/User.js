const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  login_history: { type: Date, default: null },
  refresh_token: { type: String }, // Refresh 토큰 추가
});

module.exports = mongoose.model('User', userSchema);
