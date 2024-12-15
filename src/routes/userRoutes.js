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
 *     description: 이메일과 비밀번호를 통해 새로운 사용자를 생성합니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *     responses:
 *       200:
 *         description: 성공적으로 회원가입됨.
 *       400:
 *         description: 잘못된 요청.
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
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공.
 *       400:
 *         description: 잘못된 요청.
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
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh 토큰
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공.
 *       400:
 *         description: 잘못된 요청.
 */
router.post('/refresh', validateInput(refreshTokenValidationRules), userController.refreshToken);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: 회원 정보 수정
 *     description: 사용자 인증 후 이메일 또는 비밀번호를 수정합니다.
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
 *               password:
 *                 type: string
 *                 description: 현재 비밀번호
 *               newPassword:
 *                 type: string
 *                 description: 새 비밀번호
 *     responses:
 *       200:
 *         description: 회원 정보 수정 성공.
 *       401:
 *         description: 인증 실패.
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * @swagger
 * /auth/user-info:
 *   get:
 *     summary: 회원 정보 조회
 *     description: 인증된 사용자의 이메일과 로그인 기록을 반환합니다.
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 정보 조회 성공.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     login_history:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 인증 실패.
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
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: 인증 실패.
 */
router.delete('/delete', authenticate, userController.deleteUser);

module.exports = router;