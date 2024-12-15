const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // 채용 공고 제목
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // 회사와의 연결 (참조)
    experience: { type: String, default: 'Not specified' }, // 요구 경력
    education: { type: String, default: 'Not specified' }, // 요구 학력
    employment_type: { type: String, default: 'Not specified' }, // 고용 형태
    salary: { type: String, default: 'Not specified' }, // 연봉 정보
    stack_tags: { type: [String], default: [] }, // 기술 스택 태그
    deadline: { type: String, default: 'Not specified' }, // 마감일
    created_at: { type: Date, default: Date.now }, // 공고 생성일
    views: { type: Number, default: 0 }, // 조회수
    applications: { type: Number, default: 0 }, // 지원자수
  },
  {
    timestamps: true, // 자동으로 createdAt, updatedAt 필드를 추가
  }
);

module.exports = mongoose.model('Job', JobSchema);
