const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0', // OpenAPI 버전
  info: {
    title: 'Node.js API Documentation', // API 이름
    version: '1.0.0', // API 버전
    description: 'This is the Swagger documentation for the Node.js API.', // API 설명
  },
  servers: [
    {
      url: 'http://localhost:8080', // 로컬 서버 URL
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // 토큰 형식 명시
      },
    },
  },
  security: [
    {
      BearerAuth: [], // 모든 API에 Bearer 인증 추가
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // API 문서화 대상 파일 경로 (라우트 파일)
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
