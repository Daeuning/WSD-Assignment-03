const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: 공고 목록 조회 및 정렬
 *     description: 채용 공고를 페이지네이션, 필터링, 정렬, 검색 기능과 함께 조회합니다.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호 (기본값 1)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: 페이지 크기 (기본값 20)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: 정렬 기준 (예: views, created_at 등)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 지역별 필터 (부분 일치 검색 가능)
 *       - in: query
 *         name: experience
 *         schema:
 *           type: string
 *         description: 경력별 필터
 *       - in: query
 *         name: salary
 *         schema:
 *           type: string
 *         description: 급여별 필터 (부분 일치)
 *       - in: query
 *         name: stack
 *         schema:
 *           type: string
 *         description: 기술 스택 필터 (쉼표로 구분된 목록)
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 키워드 검색 (공고 제목 기준)
 *     responses:
 *       200:
 *         description: 공고 목록 조회 성공
 *       400:
 *         description: 요청 실패
 */
router.get('/', jobController.getJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: 공고 상세 조회
 *     description: 특정 공고의 상세 정보를 조회합니다.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공고 ID
 *     responses:
 *       200:
 *         description: 공고 상세 조회 성공
 *       400:
 *         description: 요청 실패
 */
router.get('/:id', jobController.getJobById);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: 공고 등록
 *     description: 새로운 채용 공고를 등록합니다.
 *     tags:
 *       - Jobs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               company_id:
 *                 type: string
 *               experience:
 *                 type: string
 *               education:
 *                 type: string
 *               employment_type:
 *                 type: string
 *               salary:
 *                 type: string
 *               stack_tags:
 *                 type: string
 *               deadline:
 *                 type: string
 *     responses:
 *       201:
 *         description: 공고 등록 성공
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공고 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               experience:
 *                 type: string
 *               education:
 *                 type: string
 *               employment_type:
 *                 type: string
 *               salary:
 *                 type: string
 *               stack_tags:
 *                 type: string
 *               deadline:
 *                 type: string
 *     responses:
 *       200:
 *         description: 공고 수정 성공
 */
router.put('/:id', authenticate, jobController.updateJob);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: 공고 삭제
 *     description: 기존 채용 공고를 삭제합니다.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 공고 ID
 *     responses:
 *       200:
 *         description: 공고 삭제 성공
 */
router.delete('/:id', authenticate, jobController.deleteJob);

module.exports = router;
