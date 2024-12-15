const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0', // OpenAPI 버전
  info: {
    title: 'Node.js API 문서', // API 이름
    version: '1.0.0', // API 버전
    description: 'Node.js로 만든 API에 대한 Swagger 문서입니다.', // API 설명
  },
  servers: [
    {
      url: 'http://localhost:8080', // 서버 URL
      description: '로컬 서버',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // API 문서화 대상 파일 경로
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
