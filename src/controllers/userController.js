const User = require('../models/User');
const JobStatistics = require('../models/JobStatistics');
const Favorite = require('../models/Favorite');
const Bookmark = require('../models/Bookmark');
const { successResponse, errorResponse } = require('../views/userView');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// 회원가입
/**
 * @function register
 * @description 사용자가 회원가입을 진행합니다.
 * @param {Object} req - 요청 객체
 * @param {string} req.body.email - 사용자 이메일
 * @param {string} req.body.password - 사용자 비밀번호
 * @param {string} [req.body.bio] - 사용자 소개 (선택)
 * @param {Object} res - 응답 객체
 * @returns {void}
 */
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
/**
 * @function login
 * @description 사용자가 로그인하고 액세스 및 리프레시 토큰을 발급받습니다.
 * @param {Object} req - 요청 객체
 * @param {string} req.body.email - 사용자 이메일
 * @param {string} req.body.password - 사용자 비밀번호
 * @param {Object} res - 응답 객체
 * @returns {void}
 */
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
      { expiresIn: '24h' } // Access 토큰은 15분 유효
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
/**
 * @function refreshToken
 * @description 기존 리프레시 토큰을 검증하고 새로운 액세스 및 리프레시 토큰을 발급합니다.
 * @param {Object} req - 요청 객체
 * @param {string} req.body.refreshToken - 기존 리프레시 토큰
 * @param {Object} res - 응답 객체
 * @returns {void}
 */
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
      { expiresIn: '1h' } // Access 토큰은 15분 유효
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
/**
 * @function authenticate
 * @description 요청 헤더에서 JWT 토큰을 검증하고 사용자 정보를 req.user에 추가합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @param {Function} next - 다음 미들웨어 실행
 * @returns {void}
 */
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

//프로필수정
/**
 * @function updateProfile
 * @description 사용자의 프로필 정보를 수정합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} res - 응답 객체
 * @returns {void}
 */
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
/**
 * @function getUserInfo
 * @description 인증된 사용자의 정보를 조회합니다. 이메일, 로그인 기록, bio 등을 반환합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} req.user - 인증 미들웨어를 통해 전달된 사용자 정보
 * @param {Object} res - 응답 객체
 * @returns {void}
 * @throws {Error} 사용자 정보 조회 실패 시 에러 메시지 반환
 */
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
/**
 * @function deleteUser
 * @description 인증된 사용자를 DB에서 삭제하고 탈퇴 처리합니다.
 * @param {Object} req - 요청 객체
 * @param {Object} req.user - 인증 미들웨어를 통해 전달된 사용자 정보
 * @param {Object} res - 응답 객체
 * @returns {void}
 * @throws {Error} 회원 탈퇴 실패 시 에러 메시지 반환
 */
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

// 관심 공고 활성/비활성화
/**
 * @function toggleFavorite
 * @description 특정 공고를 사용자의 관심 공고 목록에 추가하거나 제거합니다.
 * @param {Object} req - 요청 객체
 * @param {string} req.body.job_id - 관심 공고로 등록/해제할 공고 ID
 * @param {Object} req.user - 인증 미들웨어를 통해 전달된 사용자 정보
 * @param {Object} res - 응답 객체
 * @returns {void}
 * @throws {Error} 관심 공고 등록/해제 실패 시 에러 메시지 반환
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const { job_id } = req.body;
    const user_id = req.user.userId;

    if (!job_id) {
      return errorResponse(res, null, '공고 ID를 입력해주세요.');
    }

    // 관심 공고 목록 찾기
    let favorite = await Favorite.findOne({ user_id });

    if (!favorite) {
      // 관심 공고 목록이 없으면 생성
      favorite = new Favorite({ user_id, jobs: [] });
    }

    // job_id 존재 여부 확인
    const jobIndex = favorite.jobs.findIndex(
      (job) => job.job_info.job_id.toString() === job_id
    );

    if (jobIndex !== -1) {
      // 이미 관심 등록된 공고 -> 관심 해제
      favorite.jobs.splice(jobIndex, 1);

      // JobStatistics에서 favorite_count 감소
      await JobStatistics.findOneAndUpdate(
        { job_id },
        { $inc: { favorite_count: -1 } }
      );

      await favorite.save();
      return successResponse(res, null, '관심 공고가 해제되었습니다.');
    } else {
      // 관심 공고 등록
      favorite.jobs.push({ job_info: { job_id, created_at: new Date() } });

      // JobStatistics에서 favorite_count 증가
      await JobStatistics.findOneAndUpdate(
        { job_id },
        { $inc: { favorite_count: 1 } },
        { upsert: true, setDefaultsOnInsert: true }
      );

      await favorite.save();
      return successResponse(res, null, '관심 공고가 등록되었습니다.');
    }
  } catch (error) {
    console.error('관심 공고 토글 에러:', error);
    errorResponse(res, error.message, '관심 공고 처리 실패');
  }
};
