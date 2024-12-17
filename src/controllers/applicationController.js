const Application = require('../models/Application');
const Job = require('../models/Job');
const JobStatistics = require('../models/JobStatistics');
const { successResponse, errorResponse } = require('../views/applicationView');

// 지원하기
exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.userId; // 인증 미들웨어에서 가져온 userId

    // 필수 입력값 확인
    if (!jobId) {
      return errorResponse(res, null, '공고 ID를 입력해주세요.');
    }

    // 공고 존재 여부 확인
    const job = await Job.findById(jobId);
    if (!job) {
      return errorResponse(res, null, '해당 공고를 찾을 수 없습니다.');
    }

    // 중복 지원 확인
    const existingApplication = await Application.findOne({ job: jobId, user: userId });
    if (existingApplication) {
      return errorResponse(res, null, '이미 지원한 공고입니다.');
    }

    // 지원 정보 저장
    const application = new Application({
      job: jobId,
      user: userId,
    });
    await application.save();

    // JobStatistics의 applications 값 1 증가
    await JobStatistics.findOneAndUpdate(
      { job_id: jobId },
      { $inc: { applications: 1 } },
      { upsert: true, new: true } // 만약 통계가 없다면 새로 생성
    );

    successResponse(res, application, '지원이 완료되었습니다.');
  } catch (error) {
    console.error('지원하기 에러:', error);
    errorResponse(res, error.message, '지원하기 실패');
  }
};


// 지원 내역 조회
exports.getApplications = async (req, res) => {
  try {
    const { status, sort = 'appliedAt' } = req.query;
    const userId = req.user.id; // 인증된 사용자 ID

    const query = { user: userId };
    if (status) {
      query['status'] = status; // 상태 필터링
    }

    const applications = await Application.find(query)
      .populate('job', 'title company deadline') // 공고 정보 추가
      .sort({ [sort]: -1 }); // 날짜 정렬

    successResponse(res, applications, '지원 내역 조회 성공');
  } catch (error) {
    console.error('지원 내역 조회 에러:', error);
    errorResponse(res, error.message, '지원 내역 조회 실패');
  }
};

// 지원 취소
exports.cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 지원 내역 존재 확인
    const application = await Application.findOne({ _id: id, user: userId });
    if (!application) {
      return errorResponse(res, null, '해당 지원 내역을 찾을 수 없습니다.');
    }

    // 취소 가능 여부 확인
    if (application.status !== '지원중') {
      return errorResponse(res, null, '이미 처리된 지원은 취소할 수 없습니다.');
    }

    // 상태 업데이트
    application.status = '취소됨';
    application.updatedAt = Date.now();
    await application.save();

    successResponse(res, application, '지원이 취소되었습니다.');
  } catch (error) {
    console.error('지원 취소 에러:', error);
    errorResponse(res, error.message, '지원 취소 실패');
  }
};
