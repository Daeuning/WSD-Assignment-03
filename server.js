const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const swaggerSpec = require('./src/config/swagger');
const swaggerUi = require('swagger-ui-express');
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

console.log('Swagger 문서: http://113.198.66.75:18027/api-docs');
