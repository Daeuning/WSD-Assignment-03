const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Company = require('./src/models/Company'); // Company 모델 불러오기
const Job = require('./src/models/Job'); // Job 모델 불러오기

require('dotenv').config(); // 환경 변수 설정

// MongoDB 연결
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch((err) => console.error('MongoDB 연결 실패:', err));

// 불필요한 텍스트를 정리하는 함수
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/수정일\s?\d{2}\/\d{2}\/\d{2}/g, '') // '수정일 24/12/16' 제거
    .replace(/\n지도보기/g, '') // '\n지도보기' 제거
    .trim(); // 앞뒤 공백 제거
};

// "등록일"을 날짜로 변환하는 함수
const parseDate = (text) => {
  const cleanedText = text.replace(/수정일\s?/g, '').trim(); // '수정일' 제거
  const dateParts = cleanedText.split('/'); // '24/12/16' 형태를 분리
  if (dateParts.length === 3) {
    return new Date(`20${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`); // '20' 붙여서 ISO Date 형식
  }
  return new Date(); // 오류 시 현재 날짜 반환
};

// 데이터 삽입 함수
const insertCrawledData = async () => {
  try {
    // JSON 파일 읽기
    const filePath = path.join(__dirname, 'crawled_data.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const crawledData = JSON.parse(rawData);

    for (const item of crawledData) {
      try {
        // 1. 회사 정보 정제 및 저장 (중복 확인)
        const companyData = {
          company_name: item['회사명'],
          industry: cleanText(item['업종']),
          website: item['홈페이지'],
          address: cleanText(item['주소']), // 지도보기 제거
          ceo_name: item['대표자명'],
          business_description: cleanText(item['사업내용']),
        };

        // 기존 회사 존재 여부 확인
        let company = await Company.findOne({ company_name: companyData.company_name });

        if (!company) {
          company = await Company.create(companyData);
          console.log(`✅ 회사 저장: ${company.company_name}`);
        } else {
          console.log(`🔄 회사 중복: ${company.company_name}`);
        }

        // 2. 채용공고 정보 정제 및 저장
        const jobData = {
          title: item['제목'],
          company: company._id, // 회사 ID 참조
          link: item['링크'],
          location: cleanText(item['지역']),
          experience: cleanText(item['경력']),
          education: cleanText(item['학력']),
          employment_type: cleanText(item['고용형태']),
          job_tag: cleanText(item['태그']),
          stack_tags: cleanText(item['직무분야'])
            ? cleanText(item['직무분야'])
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag) // 직무 분야 정제
            : [],
          deadline: new Date(item['마감일'].replace('~ ', '2024-')), // 마감일 처리
          created_at: parseDate(item['등록일']), // 등록일을 날짜로 변환
        };

        // 중복된 채용 공고 확인 (제목과 회사 ID 기준)
        const existingJob = await Job.findOne({ title: jobData.title, company: company._id });

        if (!existingJob) {
          await Job.create(jobData);
          console.log(`✅ 채용 공고 저장: ${jobData.title}`);
        } else {
          console.log(`🔄 채용 공고 중복: ${jobData.title}`);
        }
      } catch (err) {
        console.error('❌ 항목 삽입 중 오류 발생:', err);
      }
    }

    console.log('🎉 모든 데이터 삽입 완료');
  } catch (err) {
    console.error('❌ 데이터 삽입 실패:', err);
  } finally {
    mongoose.connection.close();
  }
};

// 함수 실행
insertCrawledData();
