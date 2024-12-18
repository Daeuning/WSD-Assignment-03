const Application = require('../models/Application');
const Job = require('../models/Job');
const JobStatistics = require('../models/JobStatistics');
const { successResponse, errorResponse } = require('../views/responseView');

// 지원하기
/**
 * @function applyJob
 * @description 사용자가 특정 공고에 지원하는 기능
 * @param {Object} req - 요청 객체 (Express)
 * @param {Object} req.body - 요청 본문
 * @param {string} req.body.jobId - 지원하려는 공고 ID
 * @param {Object} req.user - 인증된 사용자 정보
 * @param {string} req.user.userId - 사용자 ID
 * @param {Object} res - 응답 객체 (Express)
 * @returns {Object} JSON 응답
 * @throws {Error} 서버 오류 또는 데이터베이스 작업 실패 시 예외 발생
 */
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
/**
 * @function getApplications
 * @description 사용자의 지원 내역을 조회하는 기능
 * @param {Object} req - 요청 객체 (Express)
 * @param {Object} req.query - 요청 쿼리 파라미터
 * @param {string} [req.query.status] - 필터링할 지원 상태 (예: '지원중')
 * @param {string} [req.query.sort='appliedAt'] - 정렬 기준 (기본값: 'appliedAt')
 * @param {Object} req.user - 인증된 사용자 정보
 * @param {string} req.user.userId - 사용자 ID
 * @param {Object} res - 응답 객체 (Express)
 * @returns {Object} JSON 응답
 * @throws {Error} 서버 오류 또는 데이터베이스 작업 실패 시 예외 발생
 */
exports.getApplications = async (req, res) => {
  try {
    const { status, sort = 'appliedAt' } = req.query; // 상태 필터링 및 정렬 기준
    const userId = req.user.userId; // 인증된 사용자 ID

    // 필터링 조건 설정
    const query = { user: userId };
    if (status) {
      query['status'] = status; // 상태가 제공된 경우 필터링
    }

    // 지원 내역 조회
    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title company deadline', // 공고의 타이틀, 회사 정보, 마감일만 가져오기
        populate: { path: 'company', select: 'company_name' }, // 회사 이름 가져오기
      })
      .sort({ [sort]: -1 }); // 날짜 정렬 (default: appliedAt 내림차순)

    successResponse(res, applications, '지원 내역 조회 성공');
  } catch (error) {
    console.error('지원 내역 조회 에러:', error);
    errorResponse(res, error.message, '지원 내역 조회 실패');
  }
};

// 지원 취소
/**
 * @function cancelApplication
 * @description 사용자가 특정 지원 내역을 취소하는 기능
 * @param {Object} req - 요청 객체 (Express)
 * @param {Object} req.params - 요청 경로 매개변수
 * @param {string} req.params.id - 취소할 지원 ID
 * @param {Object} req.user - 인증된 사용자 정보
 * @param {string} req.user.userId - 사용자 ID
 * @param {Object} res - 응답 객체 (Express)
 * @returns {Object} JSON 응답
 * @throws {Error} 서버 오류 또는 데이터베이스 작업 실패 시 예외 발생
 */
exports.cancelApplication = async (req, res) => {
  try {
    const { id } = req.params; // 지원 ID
    const userId = req.user.userId; // 인증된 사용자 ID

    // 지원 내역 존재 확인
    const application = await Application.findOne({ _id: id, user: userId });
    if (!application) {
      return errorResponse(res, null, '해당 지원 내역을 찾을 수 없습니다.');
    }

    // 취소 불가능 상태 확인
    const notCancellableStates = ['취소됨', '합격', '불합격'];
    if (notCancellableStates.includes(application.status)) {
      return errorResponse(res, null, `이미 '${application.status}' 상태인 지원은 취소할 수 없습니다.`);
    }

    // 취소 가능 상태 확인
    if (application.status === '지원중') {
      // 상태 업데이트
      application.status = '취소됨';
      application.updatedAt = Date.now();
      await application.save();

      // JobStatistics에서 applications 값 감소
      await JobStatistics.findOneAndUpdate(
        { job_id: application.job },
        { $inc: { applications: -1 } }, // applications 필드 1 감소
        { new: true }
      );

      return successResponse(res, application, '지원이 취소되었습니다.');
    }

    // 기타 예상치 못한 상태 처리
    return errorResponse(res, null, '지원 상태를 확인할 수 없습니다.');
  } catch (error) {
    console.error('지원 취소 에러:', error);
    errorResponse(res, error.message, '지원 취소 실패');
  }
};

