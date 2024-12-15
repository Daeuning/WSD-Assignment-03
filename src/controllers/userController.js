const User = require('../models/User');
const { successResponse, errorResponse } = require('../views/userView');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일 형식 검증
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: '유효하지 않은 이메일 형식입니다.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    // Base64 비밀번호 암호화
    const encodedPassword = Buffer.from(password).toString('base64');

    const newUser = new User({
      email,
      password: encodedPassword,
    });

    await newUser.save();

    res.status(200).json({ success: true, message: '회원 가입 성공', data: { userId: newUser._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: '회원 가입 실패', error: error.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, null, '사용자를 찾을 수 없습니다.');
    }

    const decodedPassword = Buffer.from(user.password, 'base64').toString('utf8');

    if (password !== decodedPassword) {
      return errorResponse(res, null, '비밀번호가 일치하지 않습니다.');
    }

    // JWT 토큰 발급
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // 토큰에 포함할 정보
      'your_secret_key', // 비밀키
      { expiresIn: '1h' } // 토큰 유효 기간
    );

    // 로그인 성공 - 로그인 시간 업데이트
    user.login_history = new Date();
    await user.save();

    successResponse(res, { token, email: user.email }, '로그인 성공');
  } catch (error) {
    errorResponse(res, error.message, '로그인 실패');
  }
};

// 회원 정보 조회
exports.getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, null, '사용자를 찾을 수 없습니다.');
    }

    successResponse(res, { email: user.email, login_history: user.login_history });
  } catch (error) {
    errorResponse(res, error.message, '사용자 정보 조회 실패');
  }
};

// 회원 탈퇴
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);

    successResponse(res, null, '회원 탈퇴 성공');
  } catch (error) {
    errorResponse(res, error.message, '회원 탈퇴 실패');
  }
};
