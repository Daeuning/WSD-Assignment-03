const express = require('express');
const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB 연결
const app = express();
const url = 'mongodb+srv://daeun3736:9Uj4KHXKb62ckm9c@cluster0.hjsty.mongodb.net/';
let db;

new MongoClient(url)
  .connect()
  .then((client) => {
    console.log('DB 연결 성공');
    db = client.db('wsd3'); // 변경된 데이터베이스 이름

    // 서버 시작
    app.listen(8080, () => {
      console.log('http://localhost:8080 에서 서버 실행중');
    });

    // 크롤링 데이터 삽입 함수 실행
    insertCrawledData();
  })
  .catch((err) => {
    console.error('DB 연결 실패:', err);
  });

// 크롤링 데이터 삽입
async function insertCrawledData() {
  try {
    // JSON 데이터 읽기
    const rawData = fs.readFileSync('./crawled_data.json', 'utf8');
    const crawledData = JSON.parse(rawData);

    const companyCollection = db.collection('company_info');
    const jobCollection = db.collection('job');

    for (const item of crawledData) {
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

      // 채용 공고 데이터 삽입
      await jobCollection.insertOne(jobData);
    }

    console.log('크롤링 데이터 삽입 완료');
  } catch (err) {
    console.error('데이터 삽입 중 오류 발생:', err);
  }
}
