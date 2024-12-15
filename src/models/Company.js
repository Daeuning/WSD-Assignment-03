const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  company_name: { type: String, required: true, unique: true }, // 회사명
  location: { type: String, default: 'Unknown' }, // 회사 위치
  size: { type: String, default: 'Unknown' }, // 회사 규모
}, {
  timestamps: true,
});

module.exports = mongoose.model('Company', CompanySchema);
