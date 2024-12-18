const JobStatistics = require('../models/JobStatistics');
const Bookmark = require('../models/Bookmark');
const { successResponse, errorResponse } = require('../views/userView');

// 북마크 활성/비활성 기능(토글)
/**
 * @function toggleBookmark
 * @description 특정 공고에 대한 북마크 등록 및 해제를 토글하는 기능
 * @param {Object} req - 요청 객체 (Express)
 * @param {Object} req.body - 요청 본문
 * @param {string} req.body.job_id - 북마크할 공고의 ID
 * @param {Object} req.user - 인증된 사용자 정보
 * @param {string} req.user.userId - 사용자 ID
 * @param {Object} res - 응답 객체 (Express)
 * @returns {Object} JSON 응답
 * @throws {Error} 데이터베이스 작업 실패 또는 서버 오류 발생 시 예외 발생
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const { job_id } = req.body;
    const user_id = req.user.userId;

    if (!job_id) {
      return errorResponse(res, null, '공고 ID를 입력해주세요.');
    }

    // 북마크 목록 찾기
    let bookmark = await Bookmark.findOne({ user_id });

    if (!bookmark) {
      // 북마크 목록이 없으면 생성
      bookmark = new Bookmark({ user_id, jobs: [] });
    }

    // job_id 존재 여부 확인
    const jobIndex = bookmark.jobs.findIndex(
      (job) => job.job_info.job_id.toString() === job_id
    );

    if (jobIndex !== -1) {
      // 이미 북마크 등록된 공고 -> 북마크 해제
      bookmark.jobs.splice(jobIndex, 1);

      // JobStatistics에서 bookmark_count 감소
      await JobStatistics.findOneAndUpdate(
        { job_id },
        { $inc: { bookmark_count: -1 } }
      );

      await bookmark.save();
      return successResponse(res, null, '북마크가 해제되었습니다.');
    } else {
      // 북마크 등록
      bookmark.jobs.push({ job_info: { job_id, created_at: new Date() } });

      // JobStatistics에서 bookmark_count 증가
      await JobStatistics.findOneAndUpdate(
        { job_id },
        { $inc: { bookmark_count: 1 } },
        { upsert: true, setDefaultsOnInsert: true }
      );

      await bookmark.save();
      return successResponse(res, null, '북마크가 등록되었습니다.');
    }
  } catch (error) {
    console.error('북마크 토글 에러:', error);
    errorResponse(res, error.message, '북마크 처리 실패');
  }
};

// 북마크 리스트 보기
/**
 * @function getBookmarks
 * @description 사용자의 북마크된 공고 목록을 페이지네이션 및 정렬 옵션을 통해 조회
 * @param {Object} req - 요청 객체 (Express)
 * @param {Object} req.query - 요청 쿼리 파라미터
 * @param {number} [req.query.page=1] - 조회할 페이지 번호 (기본값: 1)
 * @param {number} [req.query.limit=10] - 페이지당 표시할 항목 수 (기본값: 10)
 * @param {string} [req.query.sort='created_at'] - 정렬 기준 필드 (기본값: 'created_at')
 * @param {string} [req.query.order='desc'] - 정렬 방향 ('asc' 또는 'desc', 기본값: 'desc')
 * @param {Object} req.user - 인증된 사용자 정보
 * @param {string} req.user.userId - 사용자 ID
 * @param {Object} res - 응답 객체 (Express)
 * @returns {Object} JSON 응답
 * @throws {Error} 데이터베이스 작업 실패 또는 서버 오류 발생 시 예외 발생
 */
exports.getBookmarks = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = req.query;

    // 페이지네이션 설정
    const currentPage = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (currentPage - 1) * pageSize;

    // 정렬 옵션 설정
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // 북마크 목록 조회
    const bookmarks = await Bookmark.find({ user_id: req.user.userId })
      .populate({
        path: 'jobs.job_info.job_id',
        select: 'title company deadline',
        populate: { path: 'company', select: 'company_name' },
      })
      .sort(sortOptions) // 정렬 적용
      .skip(skip) // 페이지 시작점
      .limit(pageSize); // 페이지 크기

    // 총 북마크 수
    const totalBookmarks = await Bookmark.aggregate([
      { $match: { user_id: req.user.userId } },
      { $project: { jobs: { $size: "$jobs" } } },
    ]);

    const totalItems = totalBookmarks[0]?.jobs || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // 응답 반환
    successResponse(res, {
      jobs: bookmarks[0]?.jobs || [],
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        pageSize,
      },
    }, '북마크 목록 조회 성공');
  } catch (error) {
    console.error('북마크 목록 조회 에러:', error);
    errorResponse(res, error.message, '북마크 목록 조회 실패');
  }
};
