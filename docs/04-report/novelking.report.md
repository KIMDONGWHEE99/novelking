# NovelKing - PDCA 완료 보고서

**프로젝트**: NovelKing (AI 소설 창작 도구)
**날짜**: 2026-03-24
**Match Rate**: 95% → 100% (Gap 해소 완료)

---

## 1. 프로젝트 개요

사용자가 작성한 글을 AI로 상업적 수준의 소설로 변환하고, 캐릭터/세계관/플롯을 체계적으로 관리하는 소설 창작 웹 애플리케이션.

**기술 스택**: Next.js 14+ / TypeScript / Novel.js / Vercel AI SDK / Dexie.js / shadcn/ui / Tailwind CSS / Zustand

---

## 2. 구현된 기능 (12개)

| # | 기능 | 설명 |
|---|------|------|
| 1 | **프로젝트 관리** | 생성/목록/대시보드/통계 (총 챕터, 총 글자 수, 장르) |
| 2 | **글쓰기 에디터** | Novel.js(Tiptap) 리치 텍스트 + 슬래시 명령어 + 자동저장 (500ms 디바운싱) |
| 3 | **AI 버블 메뉴** | 텍스트 선택 → 6가지 인라인 변환 (소설체/묘사/대화/긴장감/감정/간결) |
| 4 | **AI 대리창작 사이드 패널** | AI 작성(채팅형, 반복 수정 가능) + 전체 변환(원클릭, 원본 백업) + 열기/닫기 애니메이션 |
| 5 | **컨텍스트 시스템** | 프로젝트/캐릭터/세계관/이전 챕터를 체크박스로 선택하여 AI에 전달 |
| 6 | **브레인스토밍** | AI 채팅 + 추천 질문 + 실시간 스트리밍 |
| 7 | **캐릭터 관리** | 카드형 목록 + 태그 필터 + AI 자동완성 상세 시트 (11가지 특성) + AI 재생성 |
| 8 | **세계관 시트** | 6가지 유형 (배경/장소/마법체계/문화/역사/기타) + AI 자동완성 + 인라인 편집 |
| 9 | **플롯 보드** | 5막 구조 칸반 (발단/전개/위기/절정/결말) + 카드 CRUD + 캐릭터 연결 + 열간 이동 |
| 10 | **내보내기** | 프로젝트 전체/개별 챕터를 TXT/HTML로 다운로드 |
| 11 | **프롬프트 커스터마이징** | 문체 스타일별 프롬프트 열람/편집/복원 + 커스텀 문체 추가 + 시스템 프롬프트 추가 지시 |
| 12 | **설정** | OpenAI/Claude 선택 + API 키 + 모델 선택 + 다크모드 |

---

## 3. 아키텍처

```
src/
├── app/                  # 15개 페이지 + 4개 API 라우트
│   ├── api/ai/           # transform, write, brainstorm, template
│   ├── project/[id]/     # dashboard, write, brainstorm, characters, worldbuilding, plot, settings
│   └── settings/         # 앱 전역 설정
├── components/           # 20+ 컴포넌트
│   ├── editor/           # Novel.js 에디터 + AI 버블 메뉴
│   ├── ai-panel/         # 대리창작 사이드 패널 (4개)
│   ├── project/          # 프로젝트 카드, 사이드바, 다이얼로그
│   └── ui/               # shadcn/ui 컴포넌트
├── lib/
│   ├── db/               # Dexie DB (9 테이블) + Repository + Hooks
│   ├── ai/               # Provider Registry + 프롬프트 + 컨텍스트 빌더 + 문체 스타일
│   ├── store/            # Zustand (AI 설정, UI 상태, 프롬프트 커스텀)
│   └── export/           # TXT/HTML 내보내기
└── types/                # 5개 타입 정의 파일
```

**핵심 설계 패턴**:
- **어댑터 패턴**: ProviderRegistry로 OpenAI/Claude 통일 인터페이스
- **Repository 패턴**: DB 접근을 Repository → Hooks로 분리 (클라우드 전환 대비)
- **컨텍스트 빌더**: 선택적 프로젝트 데이터 수집 → LLM 프롬프트 조합
- **스타일 프롬프트 시스템**: 문체별 기본 프롬프트 + 사용자 커스텀 오버라이드

---

## 4. 데이터 모델 (IndexedDB - 9 테이블)

| 테이블 | 레코드 수 | 용도 |
|--------|-----------|------|
| projects | 프로젝트별 1개 | 소설 프로젝트 메타데이터 |
| chapters | 프로젝트당 N개 | 챕터 내용 + 원본 초안 |
| characters | 프로젝트당 N개 | 캐릭터 프로필 + 태그 + 특성 |
| worldElements | 프로젝트당 N개 | 세계관 설정 (6가지 유형) |
| plotColumns | 프로젝트당 5개 | 칸반 열 (5막 구조) |
| plotCards | 열당 N개 | 플롯 카드 + 캐릭터 연결 |
| chatSessions | 프로젝트당 N개 | 브레인스토밍 세션 |
| chatMessages | 세션당 N개 | 채팅 메시지 |
| aiSettings | 1개 | AI 설정 |

---

## 5. Gap 분석 결과

| 항목 | 결과 |
|------|------|
| 총 체크포인트 | 35개 |
| 완전 구현 | 35개 (패널 애니메이션 Gap 해소) |
| 미구현 | 0개 |
| 계획 초과 구현 | 7개 |

**계획 초과 구현 항목**:
1. 문체 스타일별 상세 프롬프트 정의 및 편집
2. 커스텀 문체 추가/삭제
3. TXT/HTML 내보내기
4. 에디터 도구바 내보내기 통합
5. AI 작성 탭 추천 프롬프트 버튼
6. 캐릭터 AI 재생성 기능
7. AI 패널 열기/닫기 애니메이션

---

## 6. 파일 구성 (총 40+ 파일)

### 새로 생성한 파일 (30+)
- 타입: 5개 (`types/project.ts`, `character.ts`, `world.ts`, `plot.ts`, `ai.ts`)
- DB: 6개 (`database.ts`, 4개 repository, 4개 hooks)
- AI: 5개 (`provider-registry.ts`, `context-builder.ts`, `prompts/transform.ts`, `write.ts`, `styles.ts`, `templates/character.ts`)
- 컴포넌트: 10+개 (에디터, AI 패널, 프로젝트 등)
- 페이지: 10+개 (App Router)
- API: 4개 (`transform`, `write`, `brainstorm`, `template`)
- 기타: `exporter.ts`, `app-store.ts`, `theme-provider.tsx`

---

## 7. 향후 확장 가능 영역

| 영역 | 설명 | 우선순위 |
|------|------|---------|
| 클라우드 동기화 | Dexie Cloud 또는 자체 백엔드 | 높음 |
| 로컬 LLM | Ollama 등 로컬 모델 지원 | 중간 |
| EPUB/DOCX 내보내기 | 전자책 형식 내보내기 | 중간 |
| 버전 히스토리 | 챕터별 변경 이력 관리 | 중간 |
| 캐릭터 관계도 | 시각적 관계 그래프 | 낮음 |
| PWA | 오프라인 앱 지원 | 낮음 |

---

## 8. 결론

NovelKing은 사용자의 4가지 핵심 요구사항을 모두 충족하며, 추가로 내보내기/프롬프트 커스터마이징/문체 시스템 등을 포함하여 총 12가지 주요 기능을 구현했습니다. Gap 분석 결과 100% Match Rate를 달성했으며, 프로젝트는 배포 가능한 상태입니다.
