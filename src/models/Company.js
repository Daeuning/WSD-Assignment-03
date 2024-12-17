const mongoose = require('mongoose');

// Company Schema 정의
const CompanySchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: true, // 필수 필드
      trim: true,
      unique: true, // 중복 방지
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    ceo_name: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    business_description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true } // 생성 및 수정 시간 자동 추가
);

// Company 모델 생성
const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;
