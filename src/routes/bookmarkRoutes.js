const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /bookmarks/toggle:
 *   post:
 *     summary: 북마크 토글
 *     description: 특정 공고를 북마크에 등록하거나 해제합니다. 북마크 상태 변경 시 `JobStatistics`에서 관련 카운트도 업데이트됩니다.
 *     tags:
 *       - Bookmarks
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job_id:
 *                 type: string
 *                 description: 북마크할 공고 ID
 *                 example: "64f6d0b5f5a4ec06a2a45612"
 *     responses:
 *       200:
 *         description: 북마크 상태가 변경되었습니다.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "북마크가 등록되었습니다."
 *       400:
 *         description: 잘못된 요청 - 공고 ID 누락 또는 유효하지 않은 요청
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "공고 ID를 입력해주세요."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "북마크 처리 실패"
 */
router.post('/', authenticate, bookmarkController.toggleBookmark);

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: 북마크 목록 조회
 *     description: 현재 사용자의 북마크된 공고 목록을 페이지네이션과 정렬 옵션을 통해 조회합니다.
 *     tags:
 *       - Bookmarks
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호 (1부터 시작)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 북마크 개수
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: created_at
 *         description: 정렬 기준 (created_at, title 등)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: desc
 *         description: 정렬 방향 (asc, desc)
 *     responses:
 *       200:
 *         description: 북마크 목록 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "북마크 목록 조회 성공"
 *               data:
 *                 jobs:
 *                   - job_info:
 *                       job_id: "64b3f1e95d7d6a32d432c4f3"
 *                       title: "Frontend Developer"
 *                       company:
 *                         company_name: "Tech Corp"
 *                       deadline: "2024-12-30T23:59:59Z"
 *                       created_at: "2024-12-14T10:00:00Z"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 3
 *                   totalItems: 15
 *                   pageSize: 5
 *       400:
 *         description: 잘못된 요청 - 유효하지 않은 정렬 또는 페이지 번호
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "잘못된 요청입니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "북마크 목록 조회 실패"
 */
router.get('/', authenticate, bookmarkController.getBookmarks);

module.exports = router;