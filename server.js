const mongoose = require('mongoose');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');
const swaggerSpec = require('./src/config/swagger'); 
const swaggerUi = require('swagger-ui-express');

const app = express();

// MongoDB 연결
const url = 'mongodb+srv://daeun3736:9Uj4KHXKb62ckm9c@cluster0.hjsty.mongodb.net/wsd3?retryWrites=true&w=majority';

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB 연결 성공');
    // 서버 시작
    app.listen(8080, () => {
      console.log('http://localhost:8080 에서 서버 실행중');
    });
  })
  .catch((err) => {
    console.error('MongoDB 연결 실패:', err);
  });

// Middleware 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 사용자 관련 라우트 추가
app.use('/auth', userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger UI 경로

console.log('Swagger 문서: http://localhost:8080/api-docs');

// 크롤링 데이터 삽입 함수
async function insertCrawledData() {
  try {
    const rawData = fs.readFileSync('./crawled_data.json', 'utf8');
    const crawledData = JSON.parse(rawData);

    const companyCollection = mongoose.connection.db.collection('company_info');
    const jobCollection = mongoose.connection.db.collection('job');

    for (const item of crawledData) {
      await insertCompanyAndJob(item, companyCollection, jobCollection);
    }

    console.log('크롤링 데이터 삽입 완료');
  } catch (err) {
    console.error('데이터 삽입 중 오류 발생:', err);
  }
}

// 회사 및 채용 공고 데이터 삽입
async function insertCompanyAndJob(item, companyCollection, jobCollection) {
  // 회사 데이터 정제
  const companyData = {
    company_name: item['회사명'],
    location: item['지역'],
    size: 'Unknown', // 회사 규모는 데이터에 없으므로 기본값 설정
  };

  // 회사 데이터 삽입 또는 기존 데이터 검색
  const existingCompany = await companyCollection.findOne({ company_name: companyData.company_name });
  const companyId = existingCompany
    ? existingCompany._id
    : (await companyCollection.insertOne(companyData)).insertedId;

  // 채용 공고 데이터 정제
  const jobData = {
    title: item['제목'],
    company: companyId,
    experience: item['경력'] || 'Not specified',
    education: item['학력'] || 'Not specified',
    employment_type: item['고용형태'] || 'Not specified',
    salary: item['태그'] || 'Not specified',
    stack_tags: item['직무분야']
      ? item['직무분야']
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [],
    deadline: item['마감일'] || 'Not specified',
    created_at: new Date().toISOString(),
    views: 0,
    applications: 0,
  };

  // 중복된 채용 공고가 있는지 확인 후 삽입
  const existingJob = await jobCollection.findOne({
    title: jobData.title,
    company: companyId,
  });

  if (!existingJob) {
    await jobCollection.insertOne(jobData);
  }
}

// 데이터 삽입용 API 추가
app.post('/api/insert-data', async (req, res) => {
  try {
    await insertCrawledData();
    res.status(200).json({ message: '데이터 삽입 성공' });
  } catch (error) {
    res.status(500).json({ message: '데이터 삽입 실패', error });
  }
});