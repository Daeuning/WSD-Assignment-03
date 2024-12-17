const User = require('../models/User');
const { successResponse, errorResponse } = require('../views/userView');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// 회원가입
exports.register = async (req, res) => {
  try {
    const { email, password, bio } = req.body;

    // 이메일 형식 검증
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: '유효하지 않은 이메일 형식입니다.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    // 중복 이메일 검사
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '이미 존재하는 이메일입니다.' });
    }

    // Base64 비밀번호 암호화
    const encodedPassword = Buffer.from(password).toString('base64');

    // 사용자 생성
    const newUser = new User({
      email,
      password: encodedPassword,
      bio: bio || '',
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

    // Access 토큰 발급
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      'your_secret_key',
      { expiresIn: '15m' } // Access 토큰은 15분 유효
    );

    // Refresh 토큰 발급
    const refreshToken = crypto.randomBytes(64).toString('hex');

    // Refresh 토큰 저장 (DB나 메모리에 저장 가능)
    user.refresh_token = refreshToken;
    await user.save();

    successResponse(res, { accessToken, refreshToken }, '로그인 성공');
  } catch (error) {
    errorResponse(res, error.message, '로그인 실패');
  }
};

//refresh 토큰
// refreshToken 갱신 메커니즘 추가
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, null, 'Refresh 토큰이 필요합니다.');
    }

    // Refresh 토큰 검증
    const user = await User.findOne({ refresh_token: refreshToken });
    if (!user) {
      return errorResponse(res, null, '유효하지 않은 Refresh 토큰입니다.');
    }

    // 새로운 Access 토큰 및 Refresh 토큰 발급
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      'your_secret_key',
      { expiresIn: '24h' } // Access 토큰은 15분 유효
    );

    const newRefreshToken = crypto.randomBytes(64).toString('hex');

    // 데이터베이스에 새로운 Refresh 토큰 저장
    user.refresh_token = newRefreshToken;
    await user.save();

    successResponse(res, { accessToken, refreshToken: newRefreshToken }, '토큰 갱신 성공');
  } catch (error) {
    errorResponse(res, error.message, '토큰 갱신 실패');
  }
};


// authenticate
exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: '토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    req.user = decoded; // req.user에 사용자 정보 저장
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
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

//프로필수정
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // 인증 미들웨어에서 추가된 사용자 정보
    const { email, password, newPassword, bio } = req.body; // bio 필드 추가

    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, null, '사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 변경
    if (password && newPassword) {
      const decodedPassword = Buffer.from(user.password, 'base64').toString('utf8');
      if (password !== decodedPassword) {
        return errorResponse(res, null, '현재 비밀번호가 일치하지 않습니다.');
      }
      user.password = Buffer.from(newPassword).toString('base64');
    }

    // 이메일 업데이트
    if (email) {
      user.email = email;
    }

    // bio 업데이트
    if (bio !== undefined) {
      user.bio = bio;
    }

    await user.save();

    successResponse(res, { email: user.email, bio: user.bio }, '회원 정보 수정 성공');
  } catch (error) {
    errorResponse(res, error.message, '회원 정보 수정 실패');
  }
};


// 회원 정보 조회
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // 인증 미들웨어를 통해 토큰에서 추출된 사용자 ID
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, null, '사용자를 찾을 수 없습니다.');
    }

    successResponse(res, {
      email: user.email,
      login_history: user.login_history,
      bio: user.bio, // bio 추가
    }, '회원 정보 조회 성공');
  } catch (error) {
    errorResponse(res, error.message, '회원 정보 조회 실패');
  }
};

// 회원 탈퇴
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId; // 인증 미들웨어를 통해 토큰에서 추출된 사용자 ID
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return errorResponse(res, null, '사용자를 찾을 수 없습니다.');
    }

    successResponse(res, null, '회원 탈퇴 성공');
  } catch (error) {
    errorResponse(res, error.message, '회원 탈퇴 실패');
  }
};