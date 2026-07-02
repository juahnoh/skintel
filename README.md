# Skintel

피부과 시술(울쎄라·써마지 등) 후, 시술 장비가 기록한 데이터를 바탕으로 만들어지는 시술 리포트를 환자에게 보여주는 모바일 웹 앱

## 주요 화면

- **랜딩** — 시작 온보딩 화면
- **홈** — 다가오는 예약, 피부 개선 지표, 최근 리포트 요약
- **예약** — 월간 캘린더 + 날짜별 예약/방문 내역
- **리포트** — 얼굴 **트리트먼트 맵**(부위별 샷·에너지를 베이지 히트맵으로), 부위별 상세, 전·후 비교, 세션 정보
- **내 정보** — 프로필 및 누적 시술 통계

## 기술 스택

React + Vite, react-router-dom(HashRouter). 

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:5173
```

## 빌드

```bash
npm run build      # dist/ 생성
npm run preview    # 빌드 결과 미리보기
```

## 배포 (GitHub Pages · gh-pages 브랜치)

빌드 결과물(`dist`)을 `gh-pages` 브랜치에 올려 배포

```bash
npm run build
cd dist
git init -q && git add -A && git commit -qm deploy
git branch -M gh-pages
git remote add origin https://github.com/juahnoh/skintel.git
git push -f origin gh-pages
```

- 배포 주소: https://juahnoh.github.io/skintel/
