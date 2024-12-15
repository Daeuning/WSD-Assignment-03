const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // 지원한 공고
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 지원한 사용자
  status: { type: String, enum: ['지원중', '취소됨', '합격', '불합격'], default: '지원중' },
  appliedAt: { type: Date, default: Date.now }, // 지원 날짜
  updatedAt: { type: Date, default: Date.now } // 상태 업데이트 날짜
});

module.exports = mongoose.model('Application', applicationSchema);
