const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true, unique: true }, // 회사명
    location: { type: String, default: 'Unknown' }, // 회사 위치
    size: { type: String, default: 'Unknown' }, // 회사 규모
  },
  {
    timestamps: true, // 자동으로 createdAt, updatedAt 필드를 추가
  }
);

module.exports = mongoose.model('Company', CompanySchema);
