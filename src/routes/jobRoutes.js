const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: 공고 목록 조회
 *     description: 필터링 및 페이지네이션을 통해 공고 목록을 조회합니다. 페이지당 데이터 개수는 고정값 20입니다.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - in: query
 *         name: page
 *         description: 페이지 번호 (1부터 시작)
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: sort
 *         description: 정렬 기준 
 *         schema:
 *           type: string
 *           default: created_at
 *       - in: query
 *         name: location
 *         description: 지역 필터링
 *         schema:
 *           type: string
 *       - in: query
 *         name: experience
 *         description: 경력 필터링
 *         schema:
 *           type: string
 *       - in: query
 *         name: salary
 *         description: 급여 필터링 
 *         schema:
 *           type: string
 *       - in: query
 *         name: stack_tags
 *         description: 기술 스택 필터링 (쉼표로 구분)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 공고 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60f5c4e2d5e44b3b4c8f1c45"
 *                       title:
 *                         type: string
 *                         example: "Node.js 백엔드 개발자 모집"
 *                       company:
 *                         type: string
 *                         example: "ABC Tech"
 *                       location:
 *                         type: string
 *                         example: "서울"
 *                       experience:
 *                         type: string
 *                         example: "3년차"
 *                       salary:
 *                         type: integer
 *                         example: 5000
 *                       stack_tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Node.js", "Express", "MongoDB"]
 *                       created_at:
 *                         type: string
 *                         example: "2024-06-17T10:15:30.123Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     totalItems:
 *                       type: integer
 *                       example: 34
 *                     pageSize:
 *                       type: integer
 *                       example: 20
 */

router.get('/', authenticate, jobController.getJobs);

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
