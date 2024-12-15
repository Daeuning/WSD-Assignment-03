const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  login_history: { type: Date, default: null },
});

module.exports = mongoose.model('User', userSchema);
