@AGENTS.md

# NovelKing - AI 소설 창작 도구

## 프로젝트 개요
"아이디어만 있지만 글재주가 서투른 사용자가 AI로 소설을 작성하고 상업적 수익을 창출할 수 있게 하는" 웹 앱.

## 기술 스택
- **프레임워크**: Next.js 16 (App Router) + TypeScript
- **에디터**: Novel.js (Tiptap 기반)
- **AI**: Vercel AI SDK + OpenAI + Anthropic
- **로컬 DB**: Dexie.js (IndexedDB)
- **클라우드 DB**: Supabase (PostgreSQL + Auth) - 연동 진행 중
- **상태관리**: Zustand (persist)
- **UI**: shadcn/ui + Tailwind CSS
- **배포**: Vercel (https://justnovelking.com)
- **GitHub**: https://github.com/KIMDONGWHEE99/novelking

## 완성된 기능 (14개)
1. 소설 마법사 (/wizard) - 아이디어 한 줄 → 시놉시스/캐릭터/세계관/플롯 자동 생성
2. AI 대리창작 사이드 패널 - AI 작성/전체 변환/교정 3탭 + 드래그 리사이즈
3. 에디터 - Novel.js 리치 텍스트 + AI 버블 메뉴 + 슬래시 명령어
4. 캐릭터 관리 - 프로필/일러스트 이미지, AI 자동완성, 세계관 연결, 특성 추천
5. 세계관 시트 - 6가지 유형 + AI 자동완성
6. 플롯 보드 - 커스텀 열 추가/편집/삭제 칸반 보드
7. 브레인스토밍 - AI 채팅 + 추천 질문
8. 프로젝트 설정 - 제목/장르/커버/AI설정/삭제
9. 챕터 진행률 대시보드 + 상태 변경 (초안→완료)
10. 문체 스타일별 프롬프트 커스터마이징
11. OpenAI + Claude 멀티 LLM (Opus 4.6, Sonnet 4.6, Haiku 4.5, GPT-4o 등)
12. TXT/HTML 내보내기
13. IndexedDB 로컬 저장
14. Google 로그인 (Supabase Auth) - Phase 1 완료

## 현재 진행 상황: Supabase 백엔드 연동

### 완료 (Phase 1 - 인증 + DB 스키마)
- [x] Supabase 패키지 설치 (@supabase/supabase-js, @supabase/ssr)
- [x] Supabase 클라이언트 (src/lib/supabase/client.ts, server.ts, middleware.ts)
- [x] Google OAuth 로그인 (src/app/login/page.tsx, src/app/auth/callback/route.ts)
- [x] 인증 미들웨어 (src/middleware.ts) - 미로그인 시 /login 리다이렉트
- [x] DB 스키마 10개 테이블 + RLS + 인덱스 (supabase/schema.sql)
- [x] Supabase Repository 시작 (src/lib/db/repositories/supabase/project.repo.ts)

### 완료 (Phase 2 - 데이터 클라우드 전환)
- [x] Supabase Repository 4개 추가 (character, world, plot, chat)
- [x] 모든 Hooks를 IndexedDB → Supabase로 전환 (로그인 필수)
- [x] 컴포넌트 13개 + exporter + context-builder의 repo import 교체
- [x] use-chat.ts 신규 훅 추가

### 완료 (Phase 3 - AI 서버 측 전환)
- [x] ANTHROPIC_API_KEY 서버 환경변수로 설정 (클라이언트 노출 없음)
- [x] AI 인증 미들웨어 (src/lib/ai/auth-middleware.ts) - 로그인 + 일일 50회 크레딧 제한
- [x] AI 모델 생성 유틸 (src/lib/ai/create-model.ts) - Anthropic만 지원
- [x] 모든 AI 라우트 6개에 인증/크레딧/로그 적용
- [x] ai_logs 테이블에 사용 로그 기록
- [x] 설정 페이지에서 "API 키 직접 입력" 제거
- [x] Provider Registry에서 OpenAI 제거, Anthropic만 유지
- [x] Zustand 스토어에서 apiKeys/getApiKey/setApiKey 제거

### 완료 (Phase 4 - 결제 UI)
- [x] 요금제 페이지 (src/app/pricing/page.tsx) - Free + Pro 비교 카드
- [x] 내 계정 페이지 (src/app/account/page.tsx) - 프로필/요금제/사용량/로그아웃
- [x] 홈 헤더에 요금제/계정 네비게이션 추가
- [ ] 토스페이먼츠 실제 연동 (사업자등록 완료 후)
- [ ] 결제 웹훅 (src/app/api/webhooks/toss/route.ts)

## 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://ibfwaczmpwyatjlpwrkq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_eW8AXi6kWK1n_u2m0P0Vjg_zZILlT9s
ANTHROPIC_API_KEY=sk-ant-...  # 서버 전용 (클라이언트 노출 안 됨)
```

## 주요 파일 구조
```
src/
├── app/
│   ├── api/ai/          # AI 라우트 6개 (transform, write, brainstorm, wizard, review, template)
│   ├── auth/callback/   # OAuth 콜백
│   ├── login/           # 로그인 페이지
│   ├── wizard/          # 소설 마법사
│   ├── settings/        # 앱 전역 설정
│   └── project/[projectId]/  # 프로젝트 내부 (대시보드, 에디터, 캐릭터, 세계관, 플롯, 설정)
├── components/
│   ├── ai-panel/        # AI 사이드 패널 (작성/변환/교정)
│   ├── editor/          # Novel.js 에디터 + AI 버블 메뉴
│   └── ui/              # shadcn/ui 컴포넌트
├── lib/
│   ├── ai/              # Provider Registry + 프롬프트 + 컨텍스트 빌더
│   ├── db/              # Dexie DB + Repository + Hooks + Supabase repo
│   ├── supabase/        # Supabase 클라이언트
│   └── store/           # Zustand 스토어
└── types/               # TypeScript 타입 정의
```

## 참고사항
- 에디터 콘텐츠는 HTML 형식으로 저장됨 (novel-editor.tsx에서 onCreate로 로드)
- AI 패널은 DraggableLayout 컴포넌트로 리사이즈 가능 (react-resizable-panels가 아닌 직접 구현)
- Supabase DB 컬럼명은 snake_case, TypeScript는 camelCase → Repository에서 변환
