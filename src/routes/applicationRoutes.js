const express = require('express');
const applicationController = require('../controllers/applicationController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: 지원하기
 *     description: 특정 공고에 지원합니다.
 *     tags:
 *       - Applications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: 지원할 공고의 ID
 *                 example: "60f5c4e2d5e44b3b4c8f1c45"
 *     responses:
 *       201:
 *         description: 지원이 완료되었습니다.
 *       400:
 *         description: 잘못된 입력 또는 중복 지원
 *       404:
 *         description: 해당 공고를 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 */
router.post('/', authenticate, applicationController.applyJob);

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: 지원 내역 조회
 *     description: 인증된 사용자의 지원 내역을 조회합니다.
 *     tags:
 *       - Applications
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 지원 상태 필터링 (지원중, 취소됨, 합격, 불합격)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [appliedAt, updatedAt]
 *           default: appliedAt
 *         description: 정렬 기준 (appliedAt, updatedAt)
 *     responses:
 *       200:
 *         description: 지원 내역 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: 지원 내역 조회 성공
 *               data:
 *                 - _id: "6761f90b35d4cd19b8471234"
 *                   status: "지원중"
 *                   appliedAt: "2024-06-17T10:15:30.123Z"
 *                   updatedAt: "2024-06-17T10:15:30.123Z"
 *                   job:
 *                     _id: "67619746f603cd8d28451fa3"
 *                     title: "프론트엔드 개발자"
 *                     deadline: "2024-07-01"
 *                     company:
 *                       company_name: "ABC Tech"
 *       400:
 *         description: 잘못된 요청 (쿼리 파라미터 오류)
 *       500:
 *         description: 서버 에러
 */
router.get('/', authenticate, applicationController.getApplications);

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: 지원 취소
 *     description: 특정 지원 내역을 취소합니다.
 *     tags:
 *       - Applications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 지원 ID
 *     responses:
 *       200:
 *         description: 지원이 취소되었습니다.
 */
router.delete('/:id', authenticate, applicationController.cancelApplication);

module.exports = router;
