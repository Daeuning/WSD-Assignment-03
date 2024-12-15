const jwt = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator'); // 입력 검증 패키지

// 인증 미들웨어: JWT 토큰 검증
exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: '토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, 'your_secret_key'); // JWT 비밀키는 환경 변수로 관리하는 것이 좋습니다.
    console.log('Decoded Token:', decoded);
    req.user = decoded; // 사용자 정보를 req.user에 저장
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
  }
};

// 권한 검사 미들웨어: 특정 역할(role) 확인
exports.authorize = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ success: false, message: '권한이 없습니다.' });
    }
    next();
  };
};

// 입력 데이터 검증 미들웨어
exports.validateInput = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  };
};

// 예시 입력 검증 규칙
exports.registerValidationRules = [
  body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
];

exports.refreshTokenValidationRules = [
  body('refreshToken').notEmpty().withMessage('Refresh 토큰이 필요합니다.')
];

exports.userIdValidationRules = [
  param('userId').isMongoId().withMessage('유효한 사용자 ID가 필요합니다.')
];
