import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import json


def crawl_saramin(keyword, pages=1):
    """
    사람인 채용공고를 크롤링하는 함수 및 기업정보 추가

    Args:
        keyword (str): 검색할 키워드
        pages (int): 크롤링할 페이지 수

    Returns:
        DataFrame: 채용공고 정보 및 기업정보가 담긴 데이터프레임
    """

    jobs = []
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ]

    for page in range(1, pages + 1):
        headers = {'User-Agent': random.choice(user_agents)}
        url = f"https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword={keyword}&recruitPage={page}"

        try:
            print(f"🔍 [{page}]페이지 요청 중: {url}")
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            print(f"✅ [{page}]페이지 요청 성공 (상태 코드: {response.status_code})")

            soup = BeautifulSoup(response.text, 'html.parser')
            job_listings = soup.select('.item_recruit')
            print(f"📋 [{page}]페이지 채용공고 수: {len(job_listings)}")

            for idx, job in enumerate(job_listings, start=1):
                try:
                    print(f"\n--- [{page}]페이지 {idx}번째 공고 ---")

                    # 회사명
                    company = job.select_one('.corp_name a').text.strip()
                    print(f"회사명: {company}")

                    # 채용 제목
                    title = job.select_one('.job_tit a').text.strip()
                    print(f"채용 제목: {title}")

                    # 채용 링크
                    link = 'https://www.saramin.co.kr' + job.select_one('.job_tit a')['href']
                    print(f"채용 링크: {link}")

                    # 기업 상세 페이지 링크
                    company_link = job.select_one('.corp_name a')['href']
                    company_url = f"https://www.saramin.co.kr{company_link}"
                    print(f"기업 상세 URL: {company_url}")

                    # 지역, 경력, 학력, 고용형태
                    conditions = job.select('.job_condition span')
                    location = conditions[0].text.strip() if len(conditions) > 0 else ''
                    experience = conditions[1].text.strip() if len(conditions) > 1 else ''
                    education = conditions[2].text.strip() if len(conditions) > 2 else ''
                    employment_type = conditions[3].text.strip() if len(conditions) > 3 else ''
                    print(f"조건: 지역={location}, 경력={experience}, 학력={education}, 고용형태={employment_type}")

                    # 태그 가져오기
                    badge = job.select_one('.area_badge .badge')
                    job_badge = badge.text.strip() if badge else ''
                    print(f"태그: {job_badge}")

                    # 마감일
                    deadline = job.select_one('.job_date .date')
                    deadline_text = deadline.text.strip() if deadline else '마감일 미기재'
                    print(f"마감일: {deadline_text}")

                    # 등록일 (job_day 클래스)
                    registration = job.select_one('.job_day')
                    registration_text = registration.text.strip().replace("등록일 ", "") if registration else '등록일 미기재'
                    print(f"등록일: {registration_text}")

                    # 직무 분야
                    job_sector = job.select_one('.job_sector')
                    sector = job_sector.text.strip() if job_sector else '직무분야 미기재'
                    print(f"직무분야: {sector}")

                    # 기업 상세 정보 가져오기
                    company_info = get_company_details(company_url)
                    print(f"기업 상세 정보: {company_info}")

                    jobs.append({
                        '회사명': company,
                        '제목': title,
                        '링크': link,
                        '지역': location,
                        '경력': experience,
                        '학력': education,
                        '고용형태': employment_type,
                        '태그': job_badge,
                        '마감일': deadline_text,      # 마감일
                        '등록일': registration_text,  # 등록일
                        '직무분야': sector,            # 직무분야
                        '업종': company_info.get('업종', 'N/A'),
                        '홈페이지': company_info.get('홈페이지', 'N/A'),
                        '주소': company_info.get('주소', 'N/A'),
                        '대표자명': company_info.get('대표자명', 'N/A'),
                        '사업내용': company_info.get('사업내용', 'N/A')
                    })

                except AttributeError as e:
                    print(f"⚠️ 항목 파싱 중 에러 발생: {e}")
                    continue

            print(f"\n✅ [{page}]페이지 크롤링 완료")
            time.sleep(random.uniform(2, 4))  # 페이지 간 랜덤 딜레이 추가

        except requests.RequestException as e:
            print(f"❌ 페이지 요청 중 에러 발생: {e}")
            continue

    return pd.DataFrame(jobs)


def get_company_details(company_url):
    """
    기업 상세 페이지에서 '업종', '홈페이지', '주소', '대표자명', '사업내용' 정보를 가져오는 함수
    """
    company_info = {
        '업종': 'N/A',
        '홈페이지': 'N/A',
        '주소': 'N/A',
        '대표자명': 'N/A',
        '사업내용': 'N/A'
    }

    # 랜덤 User-Agent 설정
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ]
    headers = {'User-Agent': random.choice(user_agents)}

    try:
        print(f"🔎 기업 상세 페이지 요청 중: {company_url}")
        time.sleep(random.uniform(1, 3))  # 랜덤 딜레이 추가
        response = requests.get(company_url, headers=headers)
        response.raise_for_status()
        print(f"✅ 기업 상세 페이지 요청 성공")

        # HTML 파싱
        soup = BeautifulSoup(response.text, 'html.parser')

        # 기업 세부 정보 가져오기
        details_groups = soup.select('.company_details_group')
        for group in details_groups:
            title = group.select_one('.tit')
            desc = group.select_one('.desc')
            if title and desc:
                title_text = title.text.strip()
                desc_text = desc.text.strip()

                if title_text == '업종':
                    company_info['업종'] = desc_text
                elif title_text == '홈페이지':
                    company_info['홈페이지'] = desc_text
                elif title_text == '주소':
                    company_info['주소'] = desc_text
                elif title_text == '대표자명':
                    company_info['대표자명'] = desc_text
                elif title_text == '사업내용':
                    company_info['사업내용'] = desc_text

    except Exception as e:
        print(f"⚠️ 기업 정보 가져오기 실패: {e}")

    return company_info


# 사용 예시
if __name__ == "__main__":
    df = crawl_saramin('javascript', pages=3)
    print(df)
    df.to_json('crawled_data.json', orient='records', force_ascii=False, indent=4)
