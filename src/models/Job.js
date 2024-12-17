const mongoose = require('mongoose');

// Job Schema 정의
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
