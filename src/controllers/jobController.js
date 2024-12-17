const Job = require('../models/Job');
const Company = require('../models/Company');
const { successResponse, errorResponse } = require('../views/jobView');

// 공고 목록 조회 (페이지네이션, 필터링, 정렬)
// 공고 목록 조회 (필터링 + 페이지네이션)
exports.getJobs = async (req, res) => {
  try {
    // Query 파라미터 받기
    const { page = 1, location, experience, salary, stack_tags } = req.query;

    // 페이지네이션 설정
    const currentPage = Math.max(1, parseInt(page)); // 최소값 1 보장
    const limit = 20; // 페이지 크기 고정
    const skip = (currentPage - 1) * limit;

    // 필터링 조건 설정
    const filters = {};
    if (location) filters.location = { $regex: location, $options: 'i' }; // 부분 일치, 대소문자 무시
    if (experience) filters.experience = { $regex: experience, $options: 'i' }; // 부분 일치, 대소문자 무시
    if (salary) {
      const [minSalary, maxSalary] = salary.split('-');
      filters.salary = { $gte: parseInt(minSalary), $lte: parseInt(maxSalary) };
    }
    if (stack_tags) {
      filters.stack_tags = { $in: stack_tags.split(',').map(tag => tag.trim()) }; // 일부 태그 일치
    }

    // 전체 데이터 수 계산
    const totalItems = await Job.countDocuments(filters);
    const totalPages = Math.ceil(totalItems / limit);

    // 필터링 및 페이지네이션된 데이터 가져오기
    const jobs = await Job.find(filters)
      .skip(skip)          // 건너뛰기
      .limit(limit);       // 페이지 크기

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


exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate('company');
    if (!job) return errorResponse(res, null, '해당 공고를 찾을 수 없습니다.');

    job.views += 1;
    await job.save();

    const relatedJobs = await Job.find({
      _id: { $ne: job._id },
      $or: [
        { company: job.company._id },
        { stack_tags: { $in: job.stack_tags } }
      ]
    }).limit(5);

    successResponse(res, { job, relatedJobs }, '공고 상세 조회 성공');
  } catch (error) {
    errorResponse(res, error.message, '공고 상세 조회 실패');
  }
};

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company_id,
      experience,
      education,
      employment_type,
      salary,
      stack_tags,
      deadline,
    } = req.body;

    // 필수 입력 값 확인
    if (!title || !company_id || !experience || !employment_type || !salary || !stack_tags || !deadline) {
      return errorResponse(res, null, '모든 필드를 입력해주세요.');
    }

    // 회사 존재 여부 확인
    const company = await Company.findById(company_id);
    if (!company) {
      return errorResponse(res, null, '존재하지 않는 회사 ID입니다.');
    }

    // 새로운 Job 생성
    const job = new Job({
      title,
      company: company_id,
      experience,
      education,
      employment_type,
      salary,
      stack_tags: stack_tags.split(',').map(tag => tag.trim()),
      deadline,
    });

    await job.save();

    successResponse(res, job, '채용 공고가 성공적으로 등록되었습니다.');
  } catch (error) {
    console.error('공고 등록 에러:', error);
    errorResponse(res, error.message, '공고 등록 실패');
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 업데이트 가능한 필드만 필터링
    const allowedUpdates = [
      'title',
      'experience',
      'education',
      'employment_type',
      'salary',
      'stack_tags',
      'deadline',
    ];
    const updateKeys = Object.keys(updates);

    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
    if (!isValidUpdate) {
      return errorResponse(res, null, '업데이트할 수 없는 필드가 포함되어 있습니다.');
    }

    // Job 업데이트
    const job = await Job.findByIdAndUpdate(
      id,
      {
        ...updates,
        ...(updates.stack_tags && { stack_tags: updates.stack_tags.split(',').map(tag => tag.trim()) }),
      },
      { new: true, runValidators: true } // 변경된 데이터 반환
    );

    if (!job) {
      return errorResponse(res, null, '해당 공고를 찾을 수 없습니다.');
    }

    successResponse(res, job, '공고가 성공적으로 수정되었습니다.');
  } catch (error) {
    console.error('공고 수정 에러:', error);
    errorResponse(res, error.message, '공고 수정 실패');
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return errorResponse(res, null, '해당 공고를 찾을 수 없습니다.');
    }

    successResponse(res, null, '공고가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('공고 삭제 에러:', error);
    errorResponse(res, error.message, '공고 삭제 실패');
  }
};
