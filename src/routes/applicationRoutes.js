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
 *     description: 사용자별 지원 내역을 조회합니다.
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
 *         description: 정렬 기준 (appliedAt, updatedAt)
 *     responses:
 *       200:
 *         description: 지원 내역 조회 성공
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
