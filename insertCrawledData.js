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
    .replace(/등록일\s?\d{2}\/\d{2}\/\d{2}/g, '') // '등록일 24/12/16' 제거
    .replace(/외\s*$/g, '') // 끝에 '외' 제거
    .replace(/스크랩 급상승/g, '') // '스크랩 급상승' 제거
    .replace(/[\n\r]/g, '') // 줄바꿈 제거
    .trim(); // 앞뒤 공백 제거
};

// "등록일"을 날짜로 변환하는 함수
const parseDate = (text) => {
  if (!text) return null; // text가 비어있으면 null 반환

  // 한글 제거: 숫자, /, 공백, 특수문자 제외 나머지 제거
  const cleanedText = text.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '').trim(); 

  // 날짜를 / 기준으로 분리
  const dateParts = cleanedText.split('/'); // '24/12/16' 형태를 분리
  
  if (dateParts.length === 3) {
    // 연도를 '20'과 결합하여 ISO 형식으로 변환
    const date = new Date(`20${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`);
    
    // 유효한 날짜인지 확인
    return isNaN(date.getTime()) ? null : date;
  }

  return null; // 유효하지 않은 포맷인 경우 null 반환
};

// "마감일"을 날짜로 변환하는 함수
const parseDeadline = (text, created_at) => {
  if (!text || text.includes('채용시')) return null; // "채용시" 또는 빈 값은 null 반환

  // created_at 유효성 검사
  const baseDate = created_at instanceof Date && !isNaN(created_at.getTime()) 
    ? created_at 
    : new Date(); // created_at이 유효하지 않으면 현재 날짜 사용

  const currentYear = baseDate.getFullYear(); // 기준 연도 가져오기
  const cleanedText = text.replace('~ ', '').trim(); // "~ " 제거
  
  // 월과 일을 두 자리 숫자로 보장
  const [month, day] = cleanedText.split('/').map((num) => num.padStart(2, '0'));

  let deadlineDate = new Date(`${currentYear}-${month}-${day}`); // ISO 형식 날짜 생성

  // 만약 created_at보다 deadline이 작다면 연도를 다음 해로 설정
  if (deadlineDate < baseDate) {
    const nextYear = currentYear + 1;
    deadlineDate = new Date(`${nextYear}-${month}-${day}`);
  }

  return isNaN(deadlineDate.getTime()) ? null : deadlineDate; // 유효하지 않은 날짜는 null 반환
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
          address: cleanText(item['주소']),
          ceo_name: item['대표자명'],
          business_description: cleanText(item['사업내용']),
        };

        let company = await Company.findOne({ company_name: companyData.company_name });
        if (!company) {
          company = await Company.create(companyData);
          console.log(`✅ 회사 저장: ${company.company_name}`);
        } else {
          console.log(`🔄 회사 중복: ${company.company_name}`);
        }

        const createdAt = parseDate(item['등록일']) || new Date();
        // 2. 채용공고 정보 정제 및 저장
        const jobData = {
          title: cleanText(item['제목']),
          company: company._id,
          link: item['링크'],
          location: cleanText(item['지역']),
          experience: cleanText(item['경력']),
          education: cleanText(item['학력']),
          employment_type: cleanText(item['고용형태']),
          job_tag: cleanText(item['태그']),
          stack_tags: Array.isArray(item['직무분야'])
          ? item['직무분야']
              .map(tag => cleanText(tag.replace(/수정일.*$/, '').replace(/\s+외.*$/, '').trim())) // '수정일' 및 '외' 뒤 제거
              .filter(tag => tag) // 빈 태그 제거
          : cleanText(item['직무분야'])
              .replace(/수정일.*$/, '') // '수정일' 및 그 뒤 텍스트 제거
              .replace(/\s+외.*$/, '')  // '외'와 그 뒤 텍스트 제거
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag), // 빈 태그 제거
          deadline: parseDeadline(item['마감일'] , createdAt), // 날짜 검증 후 설정
          created_at: createdAt, // 날짜가 유효하지 않으면 현재 날짜
        };    

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
