# Just Bible

당신의 일상에 가장 단순한 성경 사전

> 성경 본문을 빠르게 검색하고, 읽고, 복사할 수 있는 웹 애플리케이션

**[justbible.life](https://justbible.life)**

## 주요 기능

### 검색

- **구절 검색** — `창 1:1`, `창세기 1장 1절`, `롬 8:28` 등 다양한 형식 지원
- **범위 검색** — `창 1:1-10`, `창 1-3`, `요 1:1-2:5` (장 간 범위)
- **초성 검색** — `ㅊㅅㄱ`으로 "창세기" 검색 가능
- **키워드 검색** — 본문 내용으로 전체 성경 검색
- **검색 범위 필터** — 전체 / 구약 / 신약 / 특정 권

### 읽기

- **성경 탐색** — 책 → 장 → 절 선택으로 본문 읽기
- **절 범위 지정** — 시작절~끝절 필터링
- **역본 비교** — 두 역본을 나란히 비교 (데스크톱: 좌우 배치, 모바일: 절별 교차)

### 복사

- **드래그 선택** (데스크톱) — 마우스로 여러 절 선택 후 Cmd/Ctrl+C
- **롱프레스 복사** (모바일) — 길게 눌러 개별 절 복사
- **4가지 복사 형식** — 기본형 / 간결형 / 줄바꿈형 / 순수 본문

### 설정

- 3개 역본: 개역개정, 개역한글, 표준새번역
- 글자 크기 / 글자 두께 조절
- 다크 모드

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Runtime | React 19 |
| Deployment | Vercel |
| Font | Geist Sans, Geist Mono, Damion |

## 프로젝트 구조

```
src/
├── app/            # 라우트 (page, layout, OG image, icon)
├── components/     # UI 컴포넌트
├── constants/      # 상수 (성경 메타데이터, 검색 설정)
├── data/           # 성경 JSON 데이터 (krv, kov, nkrv)
├── hooks/          # 커스텀 훅 (useBible, useDebounce)
├── lib/            # 유틸리티 (검색 로직, 초성 처리, 복사 포맷)
└── types/          # TypeScript 타입 정의
```

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

## 브랜치 전략

| 브랜치 | 용도 |
|--------|------|
| `main` | 배포용 (항상 안정) |
| `dev` | 개발 통합 |
| `feature/*` | 기능별 브랜치 |
