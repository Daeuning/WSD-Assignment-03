const mongoose = require('mongoose');
const Job = require('../models/Job');
const Company = require('../models/Company');
const SearchHistory = require('../models/SearchHistory');
const JobStatistics = require('../models/JobStatistics');
const JobReview = require('../models/JobReview');
const { successResponse, errorResponse } = require('../views/responseView');

// 검색 기록 저장 함수
/**
 * @function saveSearchHistory
 * @description 사용자 검색 기록을 저장합니다.
 * @param {string} userId - 사용자 ID
 * @param {string} keyword - 검색어
 * @returns {void}
 */
const saveSearchHistory = async (userId, keyword) => {
  try {
    if (!userId) return; // userId가 없는 경우 기록하지 않음

    // 검색어가 이미 존재하는지 확인
    const existingHistory = await SearchHistory.findOne({
      user_id: userId,
      search_keyword: keyword,
    });

    if (existingHistory) {
      // 이미 존재하면 검색 횟수 증가
      existingHistory.search_count += 1;
      existingHistory.updated_at = new Date(); // 검색 시간 업데이트
      await existingHistory.save();
    } else {
      // 존재하지 않으면 새 검색 기록 저장
      await SearchHistory.create({
        user_id: userId,
        search_keyword: keyword,
      });
    }
  } catch (error) {
    console.error('❌ 검색 기록 저장 실패:', error.message);
  }
};

// 공고 목록 조회 (필터링 + 페이지네이션 + 정렬 + 검색)
/**
 * @function getJobs
 * @description 공고 목록을 조회합니다. 필터링, 페이지네이션, 정렬, 검색 기능을 제공합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 */
exports.getJobs = async (req, res) => {
  try {
    // Query 파라미터 받기
    const {
      page = 1,
      location,
      experience,
      salary,
      stack_tags,
      sortBy = 'created_at',
      order = 'desc',
      company_name, // 회사명 검색
      title,        // 포지션 검색
      keyword,      // 키워드 검색
    } = req.query;

    // 페이지네이션 설정
    const currentPage = Math.max(1, parseInt(page));
    const limit = 20;
    const skip = (currentPage - 1) * limit;

    // 필터링 조건 설정
    const filters = {};
    if (location) filters.location = { $regex: location, $options: 'i' };
    if (experience) filters.experience = { $regex: experience, $options: 'i' };
    if (salary) {
      const [minSalary, maxSalary] = salary.split('-');
      filters.salary = { $gte: parseInt(minSalary), $lte: parseInt(maxSalary) };
    }
    if (stack_tags) {
      filters.stack_tags = { $in: stack_tags.split(',').map(tag => tag.trim()) };
    }

    // 검색 조건 추가
    if (company_name) {
      const companies = await Company.find({
        company_name: { $regex: company_name, $options: 'i' },
      }).select('_id'); // Company _id만 가져옴
      filters.company = { $in: companies.map(c => c._id) };
    }

    if (title) {
      filters.title = { $regex: title, $options: 'i' };
    }

    if (keyword) {
      filters.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { job_tag: { $regex: keyword, $options: 'i' } },
        { stack_tags: { $in: [new RegExp(keyword, 'i')] } },
      ];

      if (req.user && req.user.userId) {
        await saveSearchHistory(req.user.userId, keyword);
      }    
    }

    // 정렬 조건 설정
    const validSortFields = ['created_at', 'deadline'];
    const sortOptions = {};
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    sortOptions[sortField] = order === 'desc' ? -1 : 1;

    // 전체 데이터 수 계산
    const totalItems = await Job.countDocuments(filters);
    const totalPages = Math.ceil(totalItems / limit);

    // 필터링 및 페이지네이션된 데이터 가져오기 + 정렬
    const jobs = await Job.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('company', 'company_name'); // 회사 정보 포함

    // 응답 반환
    res.status(200).json({
      status: 'success',
      data: jobs,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        pageSize: limit,
      },
      sort: {
        sortBy,
        order,
      },
    });
  } catch (error) {
    console.error('Error fetching job listings:', error);
    res.status(500).json({
      status: 'error',
      message: '공고 목록 조회 실패',
      error: error.message,
    });
  }
};

// 공고 id로 상세 정보 조회
/**
 * @function getJobById
 * @description 특정 공고의 상세 정보를 조회합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 */
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // 공고 상세 정보 조회
    const job = await Job.findById(id)
      .populate('company', 'company_name industry website');

    if (!job) {
      return errorResponse(res, null, '해당 공고를 찾을 수 없습니다.');
    }

    // JobStatistics 모델에서 views 값을 1 증가시킴
    await JobStatistics.findOneAndUpdate(
      { job_id: id }, // Job의 ID에 해당하는 통계 찾기
      { $inc: { views: 1 } }, // views 값 1 증가
      { upsert: true, new: true } // 없으면 생성 (upsert), 업데이트된 문서 반환
    );

    // 관련 공고 조회: 같은 회사 또는 스택 태그가 일치하는 공고
    const relatedJobs = await Job.find({
      _id: { $ne: job._id }, // 현재 공고 제외
      $or: [
        { company: job.company._id }, // 같은 회사의 공고
        { stack_tags: { $in: job.stack_tags } }, // 기술 스택이 일치하는 공고
      ],
    })
      .limit(5)
      .sort({ created_at: -1 }); // 최신 공고 우선 정렬

    successResponse(
      res,
      { job, relatedJobs },
      '공고 상세 조회 성공'
    );
  } catch (error) {
    console.error('❌ 공고 상세 조회 실패:', error.message);
    errorResponse(res, error.message, '공고 상세 조회 실패');
  }
};

// 공고 등록
/**
 * @function createJob
 * @description 새로운 채용 공고를 생성하고 필요시 회사 정보를 생성합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @returns {void}
 */
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company_name, // 회사명
      industry, // 업종
      website, // 회사 홈페이지
      address, // 회사 주소
      ceo_name, // 대표자명
      business_description, // 사업 내용
      experience,
      education,
      employment_type,
      salary,
      stack_tags,
      deadline,
      link, // 채용 공고 링크
    } = req.body;

    // 필수 입력 값 검증
    if (!title || !company_name || !experience || !employment_type || !stack_tags || !deadline || !link) {
      return errorResponse(res, null, '모든 필수 필드를 입력해주세요.');
    }

    // 1. 회사 정보 확인 및 저장 (중복 체크)
    let company = await Company.findOne({ company_name });

    if (!company) {
      company = new Company({
        company_name,
        industry: industry || '',
        website: website || '',
        address: address || '',
        ceo_name: ceo_name || '',
        business_description: business_description || '',
      });
      await company.save();
    }

    // 2. 마감일 검증
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime()) || parsedDeadline < new Date()) {
      return errorResponse(res, null, '유효한 마감일을 입력해주세요. 마감일은 현재 날짜 이후여야 합니다.');
    }

    // 3. 채용 공고 생성
    const job = new Job({
      title,
      company: company._id, // 생성된 회사 ID 연결
      experience,
      education: education || '',
      employment_type,
      stack_tags: stack_tags.split(',').map(tag => tag.trim()),
      deadline: parsedDeadline,
      link, // 링크 추가
    });

    await job.save();

    successResponse(res, { job, company}, '채용 공고와 회사 정보가 성공적으로 등록되었습니다.');
  } catch (error) {
    console.error('공고 및 회사 등록 에러:', error);
    errorResponse(res, error.message, '공고 및 회사 등록 실패');
  }
};


// 공고 수정
/**
 * @function updateJob
 * @description 기존 채용 공고를 수정합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @returns {void}
 */
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params; // 공고 ID
    const updates = req.body; // 업데이트할 데이터

    // 업데이트 가능한 필드 목록
    const allowedUpdates = [
      'title',
      'experience',
      'education',
      'employment_type',
      'stack_tags',
      'deadline',
    ];

    // 업데이트 필드 검증
    const updateKeys = Object.keys(updates);
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
    if (!isValidUpdate) {
      return errorResponse(res, null, '업데이트할 수 없는 필드가 포함되어 있습니다.');
    }

    // 마감일 검증
    if (updates.deadline) {
      const parsedDeadline = new Date(updates.deadline);
      if (isNaN(parsedDeadline.getTime()) || parsedDeadline < new Date()) {
        return errorResponse(res, null, '유효한 마감일을 입력해주세요. 마감일은 현재 날짜 이후여야 합니다.');
      }
      updates.deadline = parsedDeadline;
    }

    // 스택 태그 배열 처리
    if (updates.stack_tags) {
      updates.stack_tags = updates.stack_tags.split(',').map(tag => tag.trim());
    }

    // 채용 공고 업데이트
    const job = await Job.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!job) {
      return errorResponse(res, null, '해당 공고를 찾을 수 없습니다.');
    }

    // JobStatistics 존재 여부 확인 후 초기화 (옵션: 필요 시 수정)
    let jobStatistics = await JobStatistics.findOne({ job_id: job._id });
    if (!jobStatistics) {
      jobStatistics = new JobStatistics({
        job_id: job._id,
        views: 0,
        applications: 0,
        bookmark_count: 0,
      });
      await jobStatistics.save();
    }

    successResponse(res, { job, jobStatistics }, '공고가 성공적으로 수정되었습니다.');
  } catch (error) {
    console.error('공고 수정 에러:', error);
    errorResponse(res, error.message, '공고 수정 실패');
  }
};


// 공고 삭제
/**
 * @function deleteJob
 * @description 특정 공고를 삭제하고 관련 통계 및 리뷰를 제거합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @returns {void}
 */
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // 요청된 ID의 유효성 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, null, '유효하지 않은 공고 ID입니다.');
    }

    // 공고 삭제
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return errorResponse(res, null, '해당 공고를 찾을 수 없습니다.');
    }

    // 관련 JobStatistics 삭제
    await JobStatistics.deleteOne({ job_id: id });

    // 관련 리뷰 삭제
    await JobReview.deleteMany({ job_id: id });

    successResponse(res, null, '공고가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('공고 삭제 에러:', error);
    errorResponse(res, error.message, '공고 삭제 실패');
  }
};


// 리뷰 작성 기능
/**
 * @function createReview
 * @description 특정 공고에 대한 리뷰를 작성합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @returns {void}
 */
exports.createReview = async (req, res) => {
  try {
    const { id } = req.params; // 공고 ID
    const { rating, comment } = req.body;
    const userId = req.user.userId; // JWT 미들웨어에서 전달된 사용자 ID

    // 필수값 확인
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, null, '평점은 1에서 5 사이의 값이어야 합니다.');
    }

    // 공고 존재 여부 확인
    const job = await Job.findById(id);
    if (!job) {
      return errorResponse(res, null, '해당 공고를 찾을 수 없습니다.');
    }

    // 기존 리뷰 확인 (중복 방지)
    const existingReview = await JobReview.findOne({ job_id: id, user_id: userId });
    if (existingReview) {
      return errorResponse(res, null, '이미 해당 공고에 리뷰를 작성하셨습니다.');
    }

    // 새로운 리뷰 생성
    const review = new JobReview({
      job_id: id,
      user_id: userId,
      rating,
      comment,
    });

    await review.save();

    successResponse(res, review, '리뷰가 성공적으로 작성되었습니다.');
  } catch (error) {
    console.error('리뷰 작성 에러:', error.message);
    errorResponse(res, error.message, '리뷰 작성 실패');
  }
};

// 특정 공고의 리뷰 조회
/**
 * @function getJobReviews
 * @description 특정 공고의 리뷰를 조회합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @returns {void}
 */
exports.getJobReviews = async (req, res) => {
  try {
    const { id } = req.params; // 공고 ID 가져오기
    const { page = 1, limit = 10 } = req.query; // 페이지네이션 설정

    // 리뷰 조회
    const reviews = await JobReview.find({ job_id: id })
      .populate('user_id', 'email') // 사용자 정보 추가 (email만 반환)
      .sort({ reviewed_at: -1 }) // 작성일 기준 내림차순
      .skip((page - 1) * limit) // 페이지네이션 적용
      .limit(parseInt(limit));

    // 리뷰 개수 가져오기
    const totalReviews = await JobReview.countDocuments({ job_id: id });

    if (!reviews || reviews.length === 0) {
      return successResponse(res, { reviews: [], total: 0 }, '리뷰가 존재하지 않습니다.');
    }

    successResponse(res, { reviews, total: totalReviews }, '리뷰 조회 성공');
  } catch (error) {
    console.error('리뷰 조회 에러:', error);
    errorResponse(res, error.message, '리뷰 조회 실패');
  }
};