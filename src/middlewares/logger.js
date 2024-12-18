// logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// 로그 출력 형식 정의
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}`;
});

// 로거 생성
const logger = createLogger({
  level: 'error', // 최소 로그 레벨 설정
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // 에러 스택 포함
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), logFormat), // 콘솔에 컬러 로그 출력
    }),
    new transports.File({ filename: 'errors.log' }), // 에러를 파일에 기록
  ],
});

module.exports = logger;
