const express = require('express');
const jobController = require('../controllers/jobController');

const router = express.Router();

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: 공고 목록 조회
 *     description: 채용 공고를 페이지네이션, 필터링, 검색 기능과 함께 조회합니다.
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
 *         name: location
 *         schema:
 *           type: string
 *         description: 지역별 필터 (부분 일치 검색 가능)
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

module.exports = router;
