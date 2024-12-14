import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import time
import random


def crawl_saramin(keyword, pages=1):
    """
    사람인 채용공고를 크롤링하는 함수

    Args:
        keyword (str): 검색할 키워드
        pages (int): 크롤링할 페이지 수

    Returns:
        DataFrame: 채용공고 정보가 담긴 데이터프레임
    """

    jobs = []
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ]
    headers = {
        'User-Agent': random.choice(user_agents)
    }

    for page in range(1, pages + 1):
        url = f"https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword={keyword}&recruitPage={page}"

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # 채용공고 목록 가져오기
            job_listings = soup.select('.item_recruit')

            for job in job_listings:
                try:
                    # 회사명
                    company = job.select_one('.corp_name a').text.strip()

                    # 채용 제목
                    title = job.select_one('.job_tit a').text.strip()

                    # 채용 링크
                    link = 'https://www.saramin.co.kr' + job.select_one('.job_tit a')['href']

                    # 지역, 경력, 학력, 고용형태
                    conditions = job.select('.job_condition span')
                    location = conditions[0].text.strip() if len(conditions) > 0 else ''
                    experience = conditions[1].text.strip() if len(conditions) > 1 else ''
                    education = conditions[2].text.strip() if len(conditions) > 2 else ''
                    employment_type = conditions[3].text.strip() if len(conditions) > 3 else ''

                    # 마감일
                    deadline = job.select_one('.job_date .date').text.strip()

                    # 직무 분야
                    job_sector = job.select_one('.job_sector')
                    sector = job_sector.text.strip() if job_sector else ''

                    # 평균연봉 정보 (있는 경우)
                    badge = job.select_one('.area_badge .badge')
                    job_badge = badge.text.strip() if badge else ''

                    # 태그 정보 추가
                    tag_elements = job.select('.tag span')
                    tags = [tag.text.strip() for tag in tag_elements] if tag_elements else []

                    jobs.append({
                        '회사명': company,
                        '제목': title,
                        '링크': link,
                        '지역': location,
                        '경력': experience,
                        '학력': education,
                        '고용형태': employment_type,
                        '마감일': deadline,
                        '직무분야': sector,
                        '태그': job_badge
                    })

                except AttributeError as e:
                    print(f"항목 파싱 중 에러 발생: {e}")
                    continue

            print(f"{page}페이지 크롤링 완료")
            time.sleep(random.uniform(1, 3))  # 서버 부하 방지를 위한 딜레이

        except requests.RequestException as e:
            print(f"페이지 요청 중 에러 발생: {e}")
            continue

    return pd.DataFrame(jobs)


# 사용 예시
if __name__ == "__main__":
    # 'python' 키워드로 3페이지 크롤링
    df = crawl_saramin('javascript', pages=3)
    print(df)
    df.to_json('crawled_data.json', orient='records', force_ascii=False, indent=4)
