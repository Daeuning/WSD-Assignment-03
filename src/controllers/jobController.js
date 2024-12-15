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
