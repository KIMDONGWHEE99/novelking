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
- **배포**: Vercel (https://novelking.vercel.app)
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

### 완료 (Phase 1)
- [x] Supabase 패키지 설치 (@supabase/supabase-js, @supabase/ssr)
- [x] Supabase 클라이언트 (src/lib/supabase/client.ts, server.ts, middleware.ts)
- [x] Google OAuth 로그인 (src/app/login/page.tsx, src/app/auth/callback/route.ts)
- [x] 인증 미들웨어 (src/middleware.ts) - 미로그인 시 /login 리다이렉트
- [x] DB 스키마 10개 테이블 + RLS + 인덱스 (supabase/schema.sql)
- [x] Supabase Repository 시작 (src/lib/db/repositories/supabase/project.repo.ts)

### 다음 작업 (Phase 2 - 데이터 클라우드 전환)
- [ ] 나머지 Supabase Repository 작성:
  - src/lib/db/repositories/supabase/character.repo.ts
  - src/lib/db/repositories/supabase/world.repo.ts
  - src/lib/db/repositories/supabase/plot.repo.ts
  - src/lib/db/repositories/supabase/chat.repo.ts
- [ ] Hooks 분기: 로그인 시 Supabase repo, 미로그인 시 IndexedDB repo 사용
  - src/lib/db/hooks/use-projects.ts 등 5개 파일 수정
- [ ] 프로젝트 생성 시 user_id 자동 주입

### Phase 3 - AI 서버 측 전환
- [ ] .env.local에 OPENAI_API_KEY, ANTHROPIC_API_KEY 설정 (우리 키)
- [ ] 모든 AI 라우트에 인증 + 크레딧 검사 미들웨어 추가 (src/lib/ai/auth-middleware.ts)
- [ ] ai_logs 테이블에 사용 로그 기록
- [ ] 피드백 API (src/app/api/ai/feedback/route.ts)
- [ ] 설정 페이지에서 "API 키 직접 입력" 제거 → 서버 키 사용

### Phase 4 - 결제 연동
- [ ] 요금제 페이지 (src/app/pricing/page.tsx)
- [ ] 내 계정 페이지 (src/app/account/page.tsx)
- [ ] 토스페이먼츠 연동 (사업자등록 필요)
- [ ] 결제 웹훅 (src/app/api/webhooks/toss/route.ts)

## 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://ibfwaczmpwyatjlpwrkq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_eW8AXi6kWK1n_u2m0P0Vjg_zZILlT9s
OPENAI_API_KEY=       # Phase 3에서 추가
ANTHROPIC_API_KEY=    # Phase 3에서 추가
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
