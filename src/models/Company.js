const mongoose = require('mongoose');

/**
 * Company 스키마
 * @typedef {Object} Company
 * @property {String} company_name - 회사 이름 (중복 불가, 필수 입력)
 * @property {String} industry - 회사 업종 (필수 입력)
 * @property {String} website - 회사 웹사이트 (선택 입력)
 * @property {String} address - 회사 주소 (필수 입력)
 * @property {String} ceo_name - 회사 대표자 이름 (기본값: 'Unknown')
 * @property {String} business_description - 회사 사업 설명 (선택 입력)
 */
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
);

// Company 모델 생성
const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;
