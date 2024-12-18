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

module.exports = router;