const Job = require('../models/Job');
const Company = require('../models/Company');
const { successResponse, errorResponse } = require('../views/jobView');

exports.getJobs = async (req, res) => {
  try {
    const { page = 1, size = 20, sort = 'created_at', location, experience, salary, stack, ...filters } = req.query;
    const skip = (Math.max(Number(page), 1) - 1) * Math.max(Number(size), 1);

    const query = {}; // 기본 쿼리

    // location 필터링
    if (location) {
      const decodedLocation = decodeURIComponent(location || '').trim();
      const companies = await Company.find({
        location: { $regex: `.*${decodedLocation}.*`, $options: 'i' }
      });

      const companyIds = companies.map(company => company._id);
      if (companyIds.length === 0) {
        return successResponse(res, { jobs: [], total: 0, page, size }, '공고 목록 조회 성공');
      }
      query['company'] = { $in: companyIds };
    }

    // experience 필터링
    if (experience) {
      query['experience'] = experience;
    }

    // salary 필터링
    if (salary) {
      query['salary'] = { $regex: salary, $options: 'i' };
    }

    // stack_tags 필터링
    if (stack) {
      query['stack_tags'] = { $in: stack.split(',').map(tag => tag.trim()) }; // 하나라도 포함
    }

    // 키워드 검색
    if (filters.keyword) {
      query['$or'] = [
        { title: { $regex: filters.keyword, $options: 'i' } },
        // { 'company.company_name': { $regex: filters.keyword, $options: 'i' } } // populate로 접근 시 사용 불가
      ];
    }

    const jobs = await Job.find(query)
      .populate('company')
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(Math.max(Number(size), 1));

    const total = await Job.countDocuments(query);

    successResponse(res, { jobs, total, page, size }, '공고 목록 조회 성공');
  } catch (error) {
    console.error('에러 발생:', error);
    errorResponse(res, error.message, '공고 목록 조회 실패');
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
