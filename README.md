## 📋 [웹서비스설계 3차 과제] 구인구직 백엔드 서버 만들기
### 전북대학교 2024-2 웹서비스 설계 3차 과제입니다

<br>

## 📌 프로젝트 개요

이 프로젝트는 **Node.js(Express.js)** 를 기반으로 백엔드 서버를 구축하고, 다음과 같은 주요 기능을 포함합니다:
- 사람인 데이터를 활용한 **채용 공고 크롤링 및 저장**.
- **RESTful API**를 제공하여 사용자와 채용 공고 데이터를 관리.
- **JWT 인증 시스템**을 통한 사용자 관리 및 보안 강화.
- **MongoDB** 또는 **MySQL**을 활용한 데이터베이스 설계 및 구현.
- **Swagger**를 활용한 API 문서화 제공.

<br>

## ✨ 주요 기능
- **회원가입 및 로그인**: JWT 기반 인증을 사용하여 사용자 관리.
- **채용 공고 관리**: 채용 공고 등록, 수정, 삭제 기능.
- **지원 내역 관리**: 사용자의 채용 지원 내역 저장 및 조회.
- **관심 공고 관리**: 사용자 관심 공고 추가 및 삭제 기능.
- **검색 및 필터링**: 채용 공고를 키워드, 기술 스택, 마감일 등에 따라 필터링.
- **통계 제공**: 조회수 및 지원자 수 통계를 제공.
- **API 문서화**: Swagger를 활용한 명확한 API 문서 제공.

<br>

## 🛠️ 기술 스택

### 주요 기술
- **Node.js**: 서버 환경 구성 및 백엔드 로직 개발.
- **Express.js**: RESTful API 서버 구현.
- **MongoDB**: 채용 정보 및 사용자 데이터 관리.
- **JWT (JSON Web Token)**: 사용자 인증 및 권한 관리.
- **Mongoose**: MongoDB 데이터 모델링 및 쿼리 처리.

### 보조 기술
- **Swagger**: API 문서화 및 테스트.
- **JCloud** : 웹사이트 배포

<br>



## 📂 폴더 구조

```
WSD-ASSIGNMENT-03/
├── .github/
├── node_modules/
├── src/
│   ├── config/
│   │   └── swagger.js                           # Swagger 설정 파일
│   │
│   ├── controllers/
│   │   ├── applicationController.js             # 지원 관리 컨트롤러
│   │   ├── bookmarkController.js                # 북마크 관리 컨트롤러
│   │   ├── jobController.js                     # 공고 관리 컨트롤러
│   │   ├── searchController.js                  # 검색 관리 컨트롤러
│   │   └── userController.js                    # 사용자 관리 컨트롤러
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js                    # 인증 미들웨어
│   │   ├── error.js                             # 커스텀 에러 클래스
│   │   ├── errorHandler.js                      # 글로벌 에러 핸들러
│   │   └── logger.js                            # 로깅 미들웨어
│   │
│   ├── models/
│   │   ├── Application.js                       # 지원 모델
│   │   ├── Bookmark.js                          # 북마크 모델
│   │   ├── Company.js                           # 회사 모델
│   │   ├── Favorite.js                          # 관심 공고 모델
│   │   ├── Job.js                               # 공고 모델
│   │   ├── JobReview.js                         # 공고 리뷰 모델
│   │   ├── JobStatistics.js                     # 공고 통계 모델
│   │   ├── SearchHistory.js                     # 검색 기록 모델
│   │   └── User.js                              # 사용자 모델
│   │
│   ├── routes/
│   │   ├── applicationRoutes.js                 # 지원 관련 라우트
│   │   ├── bookmarkRoutes.js                    # 북마크 관련 라우트
│   │   ├── jobRoutes.js                         # 공고 관련 라우트
│   │   ├── searchRoutes.js                      # 검색 관련 라우트
│   │   └── userRoutes.js                        # 사용자 관련 라우트
│   │
│   ├── views/
│   │   └── responseView.js                      # 성공 및 에러 응답 처리 뷰
│
├── .env                                         # 환경변수 설정
├── .gitignore                                   # Git 제외 설정
├── crawled_data.json                            # 크롤링된 데이터 파일
├── crawler.py                                   # 데이터 크롤링 스크립트
├── errors.log                                   # 에러 로그 파일
├── insertCrawledData.js                         # 크롤링 데이터 삽입 스크립트
├── output.log                                   # 서버 출력 로그
├── package-lock.json                            # 의존성 잠금 파일
├── package.json                                 # 프로젝트 설정 및 의존성 관리
├── README.md                                    # 프로젝트 설명 파일
├── requirements.txt                             # Python 의존성 목록
├── restart_server.sh                            # 서버 재시작 스크립트
└── server.js                                    # 서버 진입점
```

<br>

## 🗄️ 데이터베이스 구조

### 1. Job 스키마
```
{
  "_id": "ObjectId",
  "title": "String",                      // 공고 제목
  "company": "ObjectId",                  // 회사 ID (Company 모델 참조)
  "link": "String",                       // 공고 링크
  "location": "String",                   // 근무지
  "experience": "String",                 // 요구 경력
  "education": "String",                  // 요구 학력
  "employment_type": "String",            // 고용 형태 (예: Full-time)
  "job_tag": "String",                    // 공고 태그
  "stack_tags": ["String"],               // 기술 스택 태그 (배열)
  "deadline": "Date",                     // 마감일
  "created_at": "Date",                   // 공고 생성일
  "statistics": "ObjectId"                // 통계 정보 (JobStatistics 모델 참조)
}
```


### 2. Company 스키마
```
{
  "_id": "ObjectId",
  "title": "String",                      // 공고 제목
  "company": "ObjectId",                  // 회사 ID (Company 모델 참조)
  "link": "String",                       // 공고 링크
  "location": "String",                   // 근무지
  "experience": "String",                 // 요구 경력
  "education": "String",                  // 요구 학력
  "employment_type": "String",            // 고용 형태 (예: Full-time)
  "job_tag": "String",                    // 공고 태그
  "stack_tags": ["String"],               // 기술 스택 태그 (배열)
  "deadline": "Date",                     // 마감일
  "created_at": "Date",                   // 공고 생성일
  "statistics": "ObjectId"                // 통계 정보 (JobStatistics 모델 참조)
}
```

### 3. User 스키마
```
{
  "_id": "ObjectId",
  "email": "String",                      // 사용자 이메일 (필수, 고유값)
  "password": "String",                   // 암호화된 비밀번호
  "bio": "String",                        // 사용자 소개
  "refresh_token": "String",              // 리프레시 토큰 (선택)
  "login_history": [                      // 로그인 기록
    {
      "logged_in_at": "Date",             // 로그인 시간
      "ip_address": "String"              // 로그인 IP
    }
  ]
}
```

### 4. Application 스키마
```
{
  "_id": "ObjectId",
  "job": "ObjectId",                      // 지원한 공고 ID (Job 모델 참조)
  "user": "ObjectId",                     // 지원한 사용자 ID (User 모델 참조)
  "status": "String",                     // 지원 상태 (예: '지원중', '취소됨', '합격', '불합격', '검토중')
  "createdAt": "Date",                    // 지원 생성일 (자동 생성)
  "updatedAt": "Date"                     // 마지막 수정일 (자동 생성)
}
```

### 5. Favorite 스키마
```
{
  "_id": "ObjectId",
  "user_id": "ObjectId",                  // 사용자 ID (User 모델 참조)
  "jobs": [                               // 관심 공고 목록
    {
      "job_info": {
        "job_id": "ObjectId",             // 관심 등록된 공고 ID (Job 모델 참조)
        "created_at": "Date"              // 관심 등록 날짜 (기본값: 현재 시간)
      }
    }
  ]
}
```

### 6. Bookmark 스키마
```
{
  "_id": "ObjectId",
  "user_id": "ObjectId",                  // 북마크를 생성한 사용자 ID (User 모델 참조)
  "jobs": [                               // 사용자가 북마크한 공고 목록
    {
      "job_info": {
        "job_id": "ObjectId",             // 북마크된 공고 ID (Job 모델 참조)
        "created_at": "Date"              // 북마크 추가 날짜 (기본값: 현재 시간)
      }
    }
  ]
}
```

### 7. JobReview 스키마
```
{
  "_id": "ObjectId",
  "job_id": "ObjectId",                    // 리뷰가 작성된 공고 ID (Job 모델 참조)
  "user_id": "ObjectId",                   // 리뷰를 작성한 사용자 ID (User 모델 참조)
  "rating": "Number",                      // 리뷰 평점 (1 ~ 5 사이)
  "comment": "String",                     // 리뷰 내용 (선택사항)
  "reviewed_at": "Date"                    // 리뷰 작성일 (기본값: 현재 시간)
}
```

### 8. JobStatistics 스키마
```
{
  "_id": "ObjectId",
  "job_id": "ObjectId",                    // 통계가 연결된 공고 ID (Job 모델 참조)
  "views": "Number",                       // 조회 수 (기본값: 0)
  "applications": "Number",                // 지원자 수 (기본값: 0)
  "bookmark_count": "Number",              // 북마크 수 (기본값: 0)
  "favorite_count": "Number"               // 관심 공고 수 (기본값: 0)
}
```
### 9. SearchHistory 스키마
```
{
  "_id": "ObjectId",
  "user_id": "ObjectId",                   // 검색 기록을 남긴 사용자 ID (User 모델 참조)
  "search_keyword": "String",              // 검색어
  "search_count": "Number",                // 동일 검색어 검색 횟수 (기본값: 1)
  "created_at": "Date"                     // 검색 기록 생성 날짜 및 시간 (기본값: 현재 시간)
}
```


<br>

## ✨ 프로젝트 실행 방법

### 1. 프로젝트 클론
```
git clone https://github.com/Daeuning/WSD-Assignment-03.git
```

### 2. 디렉토리 이동
```
cd WSD-Assignment-03
```

### 3. 의존성 설치
```
npm install
```
```
pip install -r requirements.txt
```


### 4. MongoDB 설정 및 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력합니다
```
MONGO_URI=<MongoDB 연결 URL>
PORT=80
```

### 5. 크롤링 데이터 삽입
crawled_data.json이 루트 디렉토리에 있는지 확인하고, 다음 명령어를 입력하여 DB에 데이터를 삽입합니다
```
node insertCrawledData.js
```

### 6. 서버 실행

```
node server.js
```

**postman** 을 통해
http://113.198.66.75:18027 에서 api를 사용하고 테스트해볼 수 있습니다.



<br>

## 🚀 배포 링크
- **URL**: [서버 엔드포인트](http://113.198.66.75:18027)
- **Swagger**: [swagger 주소](http://113.198.66.75:18027/api-docs)

