const JobStatistics = require('../models/JobStatistics');
const Bookmark = require('../models/Bookmark');
const { successResponse, errorResponse } = require('../views/userView');

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
