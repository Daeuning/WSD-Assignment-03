const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middlewares/authMiddleware');

// 상위 3개 검색 키워드 반환 라우트
router.get('/top-keywords', authenticate, searchController.getTopSearchKeywords);

module.exports = router;
