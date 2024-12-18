const express = require('express');
const applicationController = require('../controllers/applicationController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: 지원하기
 *     description: 특정 공고에 지원합니다. 이미 지원한 공고에 대해 중복 지원을 방지하며, 지원 성공 시 관련 통계 정보가 업데이트됩니다.
 *     tags:
 *       - Applications
 *     security:
 *       - BearerAuth: []
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
 *                 example: "64f6d0b5f5a4ec06a2a45612"
 *     responses:
 *       201:
 *         description: 지원이 완료되었습니다.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "지원이 완료되었습니다."
 *               data:
 *                 _id: "6761f90b35d4cd19b8471234"
 *                 job: "64f6d0b5f5a4ec06a2a45612"
 *                 user: "60f5c4e2d5e44b3b4c8f1c45"
 *                 status: "지원중"
 *                 createdAt: "2024-06-17T10:15:30.123Z"
 *       400:
 *         description: 잘못된 요청 - 입력값 누락 또는 중복 지원
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "이미 지원한 공고입니다."
 *       404:
 *         description: 해당 공고를 찾을 수 없습니다.
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
 *               message: "지원하기 실패"
 */
router.post('/', authenticate, applicationController.applyJob);

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: 지원 내역 조회
 *     description: 인증된 사용자의 지원 내역을 상태 및 정렬 기준에 따라 조회합니다.
 *     tags:
 *       - Applications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [지원중, 취소됨, 합격, 불합격, 검토중]
 *         description: 지원 상태 필터링
 *         example: "지원중"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [appliedAt, updatedAt]
 *           default: appliedAt
 *         description: 정렬 기준 (appliedAt, updatedAt)
 *         example: "appliedAt"
 *     responses:
 *       200:
 *         description: 지원 내역 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "지원 내역 조회 성공"
 *               data:
 *                 - _id: "6761f90b35d4cd19b8471234"
 *                   status: "지원중"
 *                   appliedAt: "2024-06-17T10:15:30.123Z"
 *                   updatedAt: "2024-06-17T10:15:30.123Z"
 *                   job:
 *                     _id: "64f6d0b5f5a4ec06a2a45612"
 *                     title: "Node.js 백엔드 개발자 모집"
 *                     deadline: "2024-07-01T12:00:00Z"
 *                     company:
 *                       company_name: "ABC Tech"
 *       400:
 *         description: 잘못된 요청 - 상태 또는 정렬 기준 오류
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "잘못된 요청입니다."
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "지원 내역 조회 실패"
 */
router.get('/', authenticate, applicationController.getApplications);

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: 지원 취소
 *     description: 특정 지원 내역을 취소합니다. 지원 상태가 `지원중`일 때만 취소가 가능합니다.
 *     tags:
 *       - Applications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 지원 ID
 *         example: "6761f90b35d4cd19b8471234"
 *     responses:
 *       200:
 *         description: 지원이 취소되었습니다.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "지원이 취소되었습니다."
 *               data:
 *                 _id: "6761f90b35d4cd19b8471234"
 *                 status: "취소됨"
 *                 appliedAt: "2024-06-17T10:15:30.123Z"
 *                 updatedAt: "2024-06-18T12:00:00.000Z"
 *       400:
 *         description: 잘못된 요청 - 이미 처리된 지원은 취소할 수 없습니다.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "이미 '취소됨' 상태인 지원은 취소할 수 없습니다."
 *       404:
 *         description: 해당 지원 내역을 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "해당 지원 내역을 찾을 수 없습니다."
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "지원 취소 실패"
 */
router.delete('/:id', authenticate, applicationController.cancelApplication);

module.exports = router;
