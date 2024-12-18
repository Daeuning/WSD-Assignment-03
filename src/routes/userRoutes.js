const express = require('express');
const userController = require('../controllers/userController');
const {
  authenticate,
  validateInput,
  registerValidationRules,
  refreshTokenValidationRules,
} = require('../middlewares/authMiddleware'); // 인증 및 검증 미들웨어 가져오기

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 사용자 회원가입
 *     description: 이메일과 비밀번호를 통해 새로운 사용자를 생성합니다. 자기소개(bio)를 추가할 수 있습니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일 (형식 검증 필요)
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호 (최소 6자 이상)
 *                 example: password123
 *               bio:
 *                 type: string
 *                 description: 짧은 자기소개 (선택사항)
 *                 example: "Hello! I'm a developer."
 *     responses:
 *       200:
 *         description: 성공적으로 회원가입됨.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "회원 가입 성공"
 *               data:
 *                 userId: "64f6d0b5f5a4ec06a2a45612"
 *       400:
 *         description: 잘못된 요청 - 입력값 검증 실패
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "유효하지 않은 이메일 형식입니다."
 */
router.post('/register', validateInput(registerValidationRules), userController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     description: 이메일과 비밀번호를 사용하여 JWT 토큰을 발급합니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "로그인 성공"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "9f8c4a95e37b..."
 *       400:
 *         description: 잘못된 요청 - 이메일 또는 비밀번호가 잘못됨
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "사용자를 찾을 수 없습니다."
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 토큰 갱신
 *     description: Refresh 토큰을 사용하여 새로운 Access 토큰을 발급합니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh 토큰
 *                 example: "9f8c4a95e37b..."
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "토큰 갱신 성공"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "f8d6b2c95e3a..."
 *       400:
 *         description: 잘못된 요청 - Refresh 토큰이 누락되었거나 유효하지 않음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "유효하지 않은 Refresh 토큰입니다."
 */
router.post('/refresh', validateInput(refreshTokenValidationRules), userController.refreshToken);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: 회원 정보 수정
 *     description: 사용자 인증 후 이메일, 비밀번호 또는 자기소개(bio)를 수정합니다.
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 새 이메일
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 description: 현재 비밀번호
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 description: 새 비밀번호
 *                 example: newpassword456
 *               bio:
 *                 type: string
 *                 description: 새 자기소개
 *                 example: "I'm a full-stack developer!"
 *     responses:
 *       200:
 *         description: 회원 정보 수정 성공.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "회원 정보 수정 성공"
 *               data:
 *                 email: "newuser@example.com"
 *                 bio: "I'm a full-stack developer!"
 *       401:
 *         description: 인증 실패 - 유효하지 않은 토큰
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "유효하지 않은 토큰입니다."
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * @swagger
 * /auth/user-info:
 *   get:
 *     summary: 회원 정보 조회
 *     description: 사용자 인증 후 회원 정보를 조회합니다.
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: "Bearer 액세스 토큰 (회원가입 및 로그인 후 발급)"
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: 회원 정보 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "회원 정보 조회 성공"
 *               data:
 *                 email: "testuser@example.com"
 *                 login_history:
 *                   - logged_in_at: "2024-12-01T12:00:00Z"
 *                     ip_address: "192.168.1.1"
 *                 bio: "Hello! I'm a developer."
 *       401:
 *         description: 인증 실패 - 유효하지 않은 토큰
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "유효하지 않은 토큰입니다."
 */
router.get('/user-info', authenticate, userController.getUserInfo);

/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     summary: 회원 탈퇴
 *     description: 인증된 사용자의 계정을 삭제합니다.
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: "Bearer 액세스 토큰 (회원가입 및 로그인 후 발급)"
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "회원 탈퇴 성공"
 *       401:
 *         description: 인증 실패 - 유효하지 않은 토큰
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "유효하지 않은 토큰입니다."
 */
router.delete('/delete', authenticate, userController.deleteUser);

/**
 * @swagger
 * /favorites/toggle:
 *   post:
 *     summary: 관심 공고 토글
 *     description: 특정 공고를 관심 공고로 등록하거나 해제합니다.
 *     tags:
 *       - Favorites
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_id
 *             properties:
 *               job_id:
 *                 type: string
 *                 description: 관심 등록 또는 해제할 공고의 ID
 *                 example: "64f6d1b5f5a4ec06a2a45613"
 *     responses:
 *       200:
 *         description: 관심 공고 상태가 변경되었습니다.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "관심 공고가 등록되었습니다."
 *       400:
 *         description: 잘못된 요청 - 공고 ID가 누락되었거나 유효하지 않음
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "공고 ID를 입력해주세요."
 *       401:
 *         description: 인증 실패 - 유효하지 않은 토큰
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "유효하지 않은 토큰입니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "관심 공고 처리 실패"
 */
router.post('/favorite', authenticate, userController.toggleFavorite);

module.exports = router;