const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /search/top-keywords:
 *   get:
 *     summary: 상위 검색 키워드 조회
 *     description: 사용자가 검색한 키워드 중 상위 3개를 반환합니다.
 *     tags:
 *       - Search
 *     security:
 *       - BearerAuth: [] # JWT 인증 필요
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: Bearer <JWT_TOKEN>
 *         description: Bearer 토큰 형식으로 제공된 JWT
 *     responses:
 *       200:
 *         description: 상위 검색 키워드 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 상위 3개 검색 키워드 조회 성공
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       search_keyword:
 *                         type: string
 *                         example: "React 개발자"
 *                       search_count:
 *                         type: integer
 *                         example: 10
 *       400:
 *         description: 잘못된 요청 - 사용자 ID가 누락됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 사용자 ID가 필요합니다.
 *       500:
 *         description: 서버 에러 - 키워드 조회 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 상위 검색 키워드 조회 실패
 *     examples:
 *       application/json:
 *         success: true
 *         message: 상위 3개 검색 키워드 조회 성공
 *         data:
 *           - search_keyword: "React 개발자"
 *             search_count: 10
 *           - search_keyword: "Node.js 개발자"
 *             search_count: 8
 *           - search_keyword: "Python 개발자"
 *             search_count: 5
 */
router.get('/top-keywords', authenticate, searchController.getTopSearchKeywords);

module.exports = router;
