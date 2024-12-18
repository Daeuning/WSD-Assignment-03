const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const bookmarkRoutes = require('./src/routes/bookmarkRoutes');
const swaggerSpec = require('./src/config/swagger');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./src/middlewares/errorHandler');
const { NotFoundError } = require('./src/middlewares/errors');
const logger = require('./src/middlewares/logger');
require('dotenv').config(); // dotenv 설정

const app = express();

// MongoDB 연결
const url = process.env.MONGO_URI;

mongoose
  .connect(url)
  .then(() => {
    console.log('MongoDB 연결 성공');
    // 서버 시작
    const PORT = 80; // 포트를 18027로 변경
    const HOST = '0.0.0.0'; // 외부 접근 허용
    app.listen(PORT, HOST, () => {
      console.log(`Server is running at http://113.198.66.75:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB 연결 실패:', err);
  });

// Middleware 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 라우트 설정
app.use('/applications', applicationRoutes);
app.use('/auth', userRoutes);
app.use('/jobs', jobRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger UI 경로
app.use('/search', searchRoutes);
app.use('/bookmarks', bookmarkRoutes);

console.log('Swagger 문서: http://113.198.66.75:18027/api-docs');

// 존재하지 않는 경로에 대한 처리
app.use((req, res, next) => {
  next(new NotFoundError(`Cannot find ${req.method} ${req.path}`));
});

// 글로벌 에러 핸들러 적용
app.use(errorHandler);