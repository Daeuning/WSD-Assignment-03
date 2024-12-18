const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /bookmarks/toggle:
 *   post:
 *     summary: 북마크 토글
 *     description: 북마크를 등록하거나 해제합니다.
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
 *     responses:
 *       200:
 *         description: 북마크 상태가 변경되었습니다.
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/', authenticate, bookmarkController.toggleBookmark);

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: 북마크 목록 조회
 *     description: 사용자별 북마크를 조회합니다.
 *     tags:
 *       - Bookmarks
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 북마크 개수
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           default: created_at
 *         description: 정렬 기준 (created_at, title 등)
 *       - name: order
 *         in: query
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
 *               message: 북마크 목록 조회 성공
 *               data:
 *                 jobs:
 *                   - job_info:
 *                       job_id: "64b3f1e95d7d6a32d432c4f3"
 *                       title: "Frontend Developer"
 *                       company:
 *                         company_name: "Tech Corp"
 *                       deadline: "2024-12-30T23:59:59Z"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 3
 *                   totalItems: 15
 *                   pageSize: 5
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.get('/', authenticate, bookmarkController.getBookmarks);

module.exports = router;