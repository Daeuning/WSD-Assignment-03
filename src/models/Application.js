const mongoose = require('mongoose');

/**
 * Application 스키마
 * @typedef {Object} Application
 * @property {mongoose.Schema.Types.ObjectId} job - 지원한 공고에 대한 참조
 * @property {mongoose.Schema.Types.ObjectId} user - 지원한 사용자에 대한 참조
 * @property {string} status - 지원 상태. 기본값은 '지원중'
 * @property {Date} createdAt - 지원이 생성된 시간 (자동 관리)
 * @property {Date} updatedAt - 지원 정보가 마지막으로 수정된 시간 (자동 관리)
 */
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
