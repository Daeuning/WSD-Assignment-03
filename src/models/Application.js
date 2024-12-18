const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true // 지원한 공고
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // 지원한 사용자
  },
  status: {
    type: String,
    enum: ['지원중', '취소됨', '합격', '불합격', '검토중'],
    default: '지원중' // 지원 상태 초기값
  },
}, { timestamps: true }); // 자동으로 createdAt, updatedAt 관리

module.exports = mongoose.model('Application', applicationSchema);
