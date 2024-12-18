const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: 공고 목록 조회
 *     description: 필터링, 페이지네이션, 정렬 옵션을 통해 공고 목록을 조회합니다. 페이지당 기본 데이터 개수는 20개입니다.
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: 페이지 번호 (1부터 시작)
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: location
 *         description: 지역 필터링
 *         schema:
 *           type: string
 *         example: "서울"
 *       - in: query
 *         name: experience
 *         description: 경력 필터링
 *         schema:
 *           type: string
 *         example: "3년차"
 *       - in: query
 *         name: salary
 *         description: 급여 범위 필터링
 *         schema:
 *           type: string
 *         example: "3000-5000"
 *       - in: query
 *         name: stack_tags
 *         description: 기술 스택 필터링 (쉼표로 구분)
 *         schema:
 *           type: string
 *         example: "Node.js,React"
 *       - in: query
 *         name: sortBy
 *         description: 정렬 기준 (created_at 또는 deadline)
 *         schema:
 *           type: string
 *         example: "created_at"
 *       - in: query
 *         name: order
 *         description: 정렬 순서 (asc 또는 desc)
 *         schema:
 *           type: string
 *         example: "desc"
 *     responses:
 *       200:
 *         description: 공고 목록 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               data:
 *                 - _id: "60f5c4e2d5e44b3b4c8f1c45"
 *                   title: "Node.js 백엔드 개발자 모집"
 *                   company: "ABC Tech"
 *                   location: "서울"
 *                   experience: "3년차"
 *                   salary: 5000
 *                   stack_tags: ["Node.js", "Express", "MongoDB"]
 *                   created_at: "2024-06-17T10:15:30.123Z"
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 2
 *                 totalItems: 34
 *                 pageSize: 20
 *               sort:
 *                 sortBy: "created_at"
 *                 order: "desc"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "잘못된 요청 - 필터링 조건 오류"
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             example:
 *               status: "error"
 *               message: "유효하지 않은 토큰입니다."
 */
router.get('/', authenticate, jobController.getJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: 공고 상세 조회
 *     description: 특정 공고의 상세 정보를 조회하고 관련 공고 목록을 반환합니다. 조회수가 자동으로 증가합니다.
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: 조회할 공고의 ID
 *         required: true
 *         schema:
 *           type: string
 *         example: "60c72b2f5f1b2c001f4a1a2a"
 *     responses:
 *       200:
 *         description: 공고 상세 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "공고 상세 조회 성공"
 *               data:
 *                 job:
 *                   _id: "60c72b2f5f1b2c001f4a1a2a"
 *                   title: "프론트엔드 개발자"
 *                   company: { company_name: "ABC Tech", industry: "IT", website: "https://abc.com" }
 *                   views: 120
 *                   stack_tags: ["React", "Node.js"]
 *                   created_at: "2024-04-01T12:00:00Z"
 *                 relatedJobs:
 *                   - _id: "60c72b3f5f1b2c001f4a1a2b"
 *                     title: "백엔드 개발자"
 *                     company: { company_name: "ABC Tech" }
 *       400:
 *         description: 잘못된 요청 - 공고 ID가 유효하지 않음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "잘못된 요청 - 공고 ID가 유효하지 않음"
 *       404:
 *         description: 해당 공고를 찾을 수 없음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "해당 공고를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "서버 오류 발생"
 */
router.get('/:id', jobController.getJobById);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: 공고 등록
 *     description: 새로운 채용 공고를 등록하고 필요 시 회사 정보를 생성합니다.
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 공고 제목
 *                 example: "Node.js 백엔드 개발자 모집"
 *               company_name:
 *                 type: string
 *                 description: 회사 이름
 *                 example: "ABC Tech"
 *               industry:
 *                 type: string
 *                 description: 회사 업종
 *                 example: "IT"
 *               website:
 *                 type: string
 *                 description: 회사 웹사이트
 *                 example: "https://www.abctech.com"
 *               address:
 *                 type: string
 *                 description: 회사 주소
 *                 example: "서울특별시 강남구"
 *               ceo_name:
 *                 type: string
 *                 description: 대표자명
 *                 example: "김철수"
 *               business_description:
 *                 type: string
 *                 description: 회사 사업 내용
 *                 example: "소프트웨어 개발 및 서비스 제공"
 *               experience:
 *                 type: string
 *                 description: 경력 요구사항
 *                 example: "3년 이상"
 *               education:
 *                 type: string
 *                 description: 학력 요구사항
 *                 example: "대학교 졸업"
 *               employment_type:
 *                 type: string
 *                 description: 고용 형태
 *                 example: "정규직"
 *               stack_tags:
 *                 type: string
 *                 description: 기술 스택 (콤마로 구분)
 *                 example: "Node.js,Express,MongoDB"
 *               deadline:
 *                 type: string
 *                 description: 공고 마감일
 *                 example: "2024-12-31"
 *               link:
 *                 type: string
 *                 description: 채용 공고 링크
 *                 example: "https://www.abctech.com/job/12345"
 *     responses:
 *       201:
 *         description: 공고 등록 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "채용 공고와 회사 정보가 성공적으로 등록되었습니다."
 *               data:
 *                 job:
 *                   title: "Node.js 백엔드 개발자 모집"
 *                   company: "64f6d0b5f5a4ec06a2a45612"
 *                 company:
 *                   company_name: "ABC Tech"
 *       400:
 *         description: 잘못된 요청 - 필수 값 누락 또는 유효하지 않은 데이터
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "모든 필수 필드를 입력해주세요."
 *       500:
 *         description: 서버 오류
 */
router.post('/', authenticate, jobController.createJob);

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: 공고 수정
 *     description: 기존 채용 공고를 수정합니다.
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공고 ID
 *         example: "64f6d0b5f5a4ec06a2a45613"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 공고 제목
 *                 example: "백엔드 개발자 모집"
 *               experience:
 *                 type: string
 *                 description: 경력 요구사항
 *                 example: "5년 이상"
 *               stack_tags:
 *                 type: string
 *                 description: 기술 스택 (콤마로 구분)
 *                 example: "Node.js,Express,React"
 *               deadline:
 *                 type: string
 *                 description: 마감일 (YYYY-MM-DD 형식)
 *                 example: "2024-12-31"
 *     responses:
 *       200:
 *         description: 공고 수정 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "공고가 성공적으로 수정되었습니다."
 *               data:
 *                 job:
 *                   title: "백엔드 개발자 모집"
 *                   stack_tags: ["Node.js", "Express", "React"]
 *       400:
 *         description: 잘못된 요청 - 유효하지 않은 필드 또는 데이터
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "업데이트할 수 없는 필드가 포함되어 있습니다."
 *       404:
 *         description: 공고를 찾을 수 없음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "해당 공고를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 */
router.put('/:id', authenticate, jobController.updateJob);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: 공고 삭제
 *     description: 기존 채용 공고를 삭제하고 관련 통계 및 리뷰를 제거합니다.
 *     tags:
 *       - Jobs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 공고 ID
 *         example: "64f6d0b5f5a4ec06a2a45613"
 *     responses:
 *       200:
 *         description: 공고 삭제 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "공고가 성공적으로 삭제되었습니다."
 *       400:
 *         description: 유효하지 않은 공고 ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "유효하지 않은 공고 ID입니다."
 *       404:
 *         description: 삭제할 공고를 찾을 수 없음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "해당 공고를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id', authenticate, jobController.deleteJob);

/**
 * @swagger
 * /jobs/{id}/reviews:
 *   post:
 *     summary: 리뷰 작성
 *     description: 특정 채용 공고에 대해 리뷰를 작성합니다. 사용자 인증이 필요합니다.
 *     tags:
 *       - Reviews
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: 공고 ID
 *           example: "64f6d0b5f5a4ec06a2a45612"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: 리뷰 평점 (1~5)
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 description: 리뷰 내용
 *                 example: "면접 절차가 간소하고 친절했습니다."
 *     responses:
 *       201:
 *         description: 리뷰 작성 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "리뷰가 성공적으로 작성되었습니다."
 *               data:
 *                 job_id: "64f6d0b5f5a4ec06a2a45612"
 *                 user_id: "64f6d0b5f5a4ec06a2a45613"
 *                 rating: 4.5
 *                 comment: "면접 절차가 간소하고 친절했습니다."
 *                 reviewed_at: "2024-12-14T10:00:00Z"
 *       400:
 *         description: 잘못된 요청 - 입력값 검증 실패
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "평점은 1에서 5 사이의 값이어야 합니다."
 *       404:
 *         description: 공고를 찾을 수 없음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "해당 공고를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "리뷰 작성 실패"
 */
router.post('/:id/reviews', authenticate, jobController.createReview);

/**
 * @swagger
 * /jobs/{id}/reviews:
 *   get:
 *     summary: 특정 공고의 리뷰 조회
 *     description: 특정 채용 공고에 대한 리뷰를 페이지네이션과 함께 조회합니다.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: 공고 ID
 *           example: "64f6d0b5f5a4ec06a2a45612"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           description: 페이지 번호
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           description: 페이지당 리뷰 개수
 *           example: 10
 *     responses:
 *       200:
 *         description: 리뷰 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "리뷰 조회 성공"
 *               data:
 *                 reviews:
 *                   - user_id:
 *                       email: "user@example.com"
 *                     rating: 4.5
 *                     comment: "면접 절차가 간소하고 친절했습니다."
 *                     reviewed_at: "2024-12-14T10:00:00Z"
 *                   - user_id:
 *                       email: "anotheruser@example.com"
 *                     rating: 5.0
 *                     comment: "최고의 회사입니다."
 *                     reviewed_at: "2024-12-12T15:30:00Z"
 *                 total: 2
 *       400:
 *         description: 요청 실패 - 유효하지 않은 입력
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "잘못된 요청입니다."
 *       404:
 *         description: 공고를 찾을 수 없음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "해당 공고를 찾을 수 없습니다."
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "리뷰 조회 실패"
 */
router.get('/:id/reviews', jobController.getJobReviews);


module.exports = router;
