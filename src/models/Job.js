const mongoose = require('mongoose');

/**
 * Job 스키마
 * @typedef {Object} Job
 * @property {String} title - 공고 제목
 * @property {mongoose.Schema.Types.ObjectId} company - 회사 ID (Company 모델 참조)
 * @property {String} link - 공고 상세 페이지 링크
 * @property {String} location - 근무지
 * @property {String} experience - 경력 요구사항
 * @property {String} education - 학력 요구사항
 * @property {String} employment_type - 고용 형태 (정규직, 계약직 등)
 * @property {String} job_tag - 공고 태그
 * @property {Array<String>} stack_tags - 기술 스택 태그 배열
 * @property {Date} deadline - 마감일
 * @property {Date} created_at - 공고 생성 날짜
 * @property {mongoose.Schema.Types.ObjectId} statistics - 통계 ID (Statistics 모델 참조)
 */
const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // 필수 필드
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company', // Company 테이블과 연결
      required: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      default: 'Not specified',
      trim: true,
    },
    education: {
      type: String,
      default: 'Not specified',
      trim: true,
    },
    employment_type: {
      type: String,
      trim: true,
    },
    job_tag: {
      type: String,
      default: '',
      trim: true,
    },
    stack_tags: {
      type: [String], // 기술 스택 태그 배열
      default: [],
    },
    deadline: {
      type: Date, // 마감일
    },
    created_at: {
      type: Date,
      default: Date.now, // 현재 시간
    },
    statistics: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Statistics', // 통계 테이블과 연결 (옵션)
    },
  },
);

// 중복 방지: 제목과 회사가 동일한 경우 중복되지 않도록 설정
JobSchema.index({ title: 1, company: 1 }, { unique: true });

// Job 모델 생성
const Job = mongoose.model('Job', JobSchema);

module.exports = Job;
