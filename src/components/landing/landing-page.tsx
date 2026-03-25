"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  PenTool,
  Wand2,
  BookOpen,
  Sparkles,
  FileText,
  Users,
  Globe,
  LayoutList,
  ArrowRight,
  Check,
  Zap,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="h-6 w-6" />
            <span className="text-xl font-bold">NovelKing</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <Button variant="ghost" size="sm">
                요금제
              </Button>
            </Link>
            <ThemeToggle />
            <Link href="/login">
              <Button size="sm">무료로 시작하기</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              AI가 당신의 글쓰기 파트너가 됩니다
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              아이디어 하나로
              <br />
              <span className="text-primary">소설을 완성하세요</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              글재주가 없어도 괜찮습니다. AI가 시놉시스, 캐릭터, 세계관, 플롯을
              자동으로 만들어주고, 챕터별로 소설을 대신 써줍니다.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2 text-base px-8">
                  무료로 시작하기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-base px-8">
                  요금제 보기
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Google 계정으로 30초 만에 가입 — 신용카드 불필요
            </p>
          </div>

          {/* 앱 미리보기 목업 */}
          <AppPreviewMockup />
        </div>
      </section>

      {/* 3단계 플로우 - 실제 예시 포함 */}
      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            3단계로 소설 완성
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            아이디어만 있으면 됩니다. 나머지는 AI가 해줍니다.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                <Wand2 className="h-6 w-6" />
              </div>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                STEP 1
              </div>
              <h3 className="text-xl font-semibold mb-3">아이디어 입력</h3>
              <div className="bg-card border rounded-lg p-4 text-left mb-3">
                <div className="text-xs text-muted-foreground mb-2">💡 입력 예시</div>
                <p className="text-sm italic text-foreground/80">
                  &ldquo;조선시대 궁녀가 현대 서울에 타임슬립해서 카페를 차리는 로맨스&rdquo;
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                한 줄이면 충분합니다. 소설 마법사가 알아서 확장합니다.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                STEP 2
              </div>
              <h3 className="text-xl font-semibold mb-3">AI 자동 생성</h3>
              <div className="bg-card border rounded-lg p-4 text-left mb-3 space-y-2">
                <div className="text-xs text-muted-foreground">✨ AI 생성 결과</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">시놉시스</span>
                  <span className="text-xs text-muted-foreground truncate">전체 스토리 구조</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">캐릭터 3명</span>
                  <span className="text-xs text-muted-foreground truncate">성격, 외모, 배경</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">세계관</span>
                  <span className="text-xs text-muted-foreground truncate">시대, 장소, 규칙</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">플롯 12장</span>
                  <span className="text-xs text-muted-foreground truncate">챕터별 줄거리</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                시놉시스, 캐릭터, 세계관, 플롯이 한 번에 완성됩니다.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                STEP 3
              </div>
              <h3 className="text-xl font-semibold mb-3">소설 완성</h3>
              <div className="bg-card border rounded-lg p-4 text-left mb-3">
                <div className="text-xs text-muted-foreground mb-2">📖 완성된 본문</div>
                <p className="text-xs leading-relaxed text-foreground/80">
                  &ldquo;은서가 눈을 떴을 때, 처음 느낀 것은 차가운 바닥이 아니라 낯선 소음이었다. 귀를 찌르는 듯한 경적 소리, 웅웅거리는 기계음...&rdquo;
                </p>
                <div className="mt-2 flex gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">AI 작성</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">문체 교정</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">스타일 변환</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                AI 에디터로 챕터별 본문을 작성하고 교정합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 기능 */}
      <section className="py-20 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            소설 창작에 필요한 모든 것
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            프로 작가의 작업 환경을 AI와 함께 무료로 사용하세요.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Wand2 className="h-5 w-5" />}
              title="소설 마법사"
              description="한 줄 아이디어 → 시놉시스, 캐릭터, 세계관, 플롯 자동 생성"
            />
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              title="AI 에디터"
              description="리치 텍스트 에디터 + AI 작성, 변환, 교정 사이드 패널"
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="캐릭터 관리"
              description="프로필, 일러스트, 성격 특성을 AI가 추천하고 관리"
            />
            <FeatureCard
              icon={<Globe className="h-5 w-5" />}
              title="세계관 설정"
              description="6가지 유형의 세계관 시트를 AI가 자동으로 채워줍니다"
            />
            <FeatureCard
              icon={<LayoutList className="h-5 w-5" />}
              title="플롯 보드"
              description="칸반 보드로 챕터 구조를 시각적으로 관리"
            />
            <FeatureCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="브레인스토밍"
              description="AI 채팅으로 아이디어를 발전시키고 막힌 부분을 해결"
            />
          </div>
        </div>
      </section>

      {/* 작품 쇼케이스 */}
      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            NovelKing으로 만든 작품들
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            이 작품들은 모두 NovelKing AI로 작성되었습니다.
            당신도 지금 바로 시작할 수 있습니다.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <ShowcaseCard
              genre="로맨스 판타지"
              title="궁녀, 서울에 오다"
              description="조선시대 궁녀가 현대에 타임슬립해 카페를 차리며 벌어지는 로맨스"
              chapters={12}
              color="from-rose-500 to-pink-600"
            />
            <ShowcaseCard
              genre="SF 스릴러"
              title="오비탈 스테이션"
              description="우주 정거장에서 발생한 미스터리 살인사건을 추적하는 보안관의 이야기"
              chapters={8}
              color="from-blue-500 to-cyan-600"
            />
            <ShowcaseCard
              genre="현대 드라마"
              title="마지막 레시피"
              description="할머니의 비밀 레시피를 찾아 전국을 여행하는 요리사 지망생의 성장기"
              chapters={15}
              color="from-amber-500 to-orange-600"
            />
          </div>
          <div className="text-center mt-10">
            <Link href="/login">
              <Button variant="outline" size="lg" className="gap-2">
                나도 소설 쓰러 가기
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 요금제 미리보기 */}
      <section className="py-20 border-t">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            무료로 시작하세요
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            기본 기능은 모두 무료. 더 많이 쓰고 싶다면 Pro로 업그레이드.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <PricingCard
              name="Free"
              price="0"
              description="소설 창작을 시작해보세요"
              features={[
                "AI 소설 작성/변환/교정",
                "하루 50회 AI 사용",
                "프로젝트 무제한 생성",
                "캐릭터/세계관/플롯 관리",
                "TXT/HTML 내보내기",
              ]}
              ctaText="무료로 시작하기"
              ctaHref="/login"
            />
            <PricingCard
              name="Pro"
              price="9,900"
              period="/월"
              description="제한 없이 마음껏 창작하세요"
              features={[
                "AI 사용 무제한",
                "Claude Opus 4.6 모델",
                "우선 응답 처리",
                "향후 추가 기능 우선 제공",
              ]}
              ctaText="곧 출시"
              highlight
              disabled
            />
          </div>
        </div>
      </section>

      {/* 최종 CTA */}
      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 첫 소설을 시작하세요
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            아이디어 한 줄이면 충분합니다. AI가 나머지를 도와드립니다.
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2 text-base px-10">
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span>NovelKing</span>
          </div>
          <p>&copy; 2025 NovelKing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ── 앱 미리보기 목업 ── */
function AppPreviewMockup() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
        {/* 가짜 타이틀바 */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-muted-foreground">justnovelking.com</span>
          </div>
        </div>

        {/* 앱 본문 */}
        <div className="flex min-h-[320px] md:min-h-[400px]">
          {/* 사이드바 */}
          <div className="hidden md:block w-48 border-r bg-muted/20 p-3 space-y-1.5">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-primary/10 text-primary text-xs font-medium">
              <FileText className="h-3.5 w-3.5" />
              1장. 낯선 세계
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              2장. 첫 만남
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              3장. 카페의 비밀
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              4장. 시간의 균열
            </div>
            <div className="border-t my-3" />
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              캐릭터 (3)
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              세계관
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
              <LayoutList className="h-3.5 w-3.5" />
              플롯 보드
            </div>
          </div>

          {/* 에디터 영역 */}
          <div className="flex-1 p-4 md:p-6">
            <h2 className="text-lg font-bold mb-1">제1장. 낯선 세계</h2>
            <div className="text-xs text-muted-foreground mb-4">2,847 자 · 초안</div>
            <div className="space-y-3 text-sm leading-relaxed text-foreground/80">
              <p>
                은서가 눈을 떴을 때, 처음 느낀 것은 차가운 바닥이 아니라 낯선
                소음이었다. 귀를 찌르는 듯한 경적 소리, 웅웅거리는 기계음, 그리고
                어디선가 들려오는 이상한 음악.
              </p>
              <p>
                &ldquo;여기가... 어디지?&rdquo;
              </p>
              <p>
                고개를 들어 주위를 둘러보니, 하늘 높이 솟은 유리 건물들이 햇빛을
                반사하며 눈부시게 빛나고 있었다. 이것은 분명 궁궐이 아니었다.
                <span className="bg-primary/20 px-0.5 rounded">|</span>
              </p>
            </div>
          </div>

          {/* AI 사이드 패널 */}
          <div className="hidden lg:block w-64 border-l bg-muted/10 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">AI 어시스턴트</span>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors">
                ✍️ 다음 문단 작성
              </button>
              <button className="w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors">
                🔄 문체 변환
              </button>
              <button className="w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors">
                📝 교정 · 윤문
              </button>
              <button className="w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors">
                💡 브레인스토밍
              </button>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-xs text-primary font-medium mb-1">AI 추천</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                은서가 현대 문물에 처음 반응하는 장면을 추가하면 독자 몰입도가 높아질 것 같습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 기능 카드 ── */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ── 작품 쇼케이스 카드 ── */
function ShowcaseCard({
  genre,
  title,
  description,
  chapters,
  color,
}: {
  genre: string;
  title: string;
  description: string;
  chapters: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-32 bg-gradient-to-br ${color} flex items-end p-4`}>
        <div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {genre}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{chapters}장 완결</span>
          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
            AI 작성
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── 요금제 카드 ── */
function PricingCard({
  name,
  price,
  period,
  description,
  features,
  ctaText,
  ctaHref,
  highlight,
  disabled,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref?: string;
  highlight?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-xl border ${highlight ? "border-primary shadow-lg ring-1 ring-primary/20" : "bg-card"}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {highlight ? (
          <Zap className="h-4 w-4 text-primary" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <h3 className="font-semibold">{name}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-3xl font-bold">{price}원</span>
        {period && (
          <span className="text-muted-foreground text-sm">{period}</span>
        )}
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      {disabled ? (
        <Button variant="outline" className="w-full" disabled>
          {ctaText}
        </Button>
      ) : (
        <Link href={ctaHref || "/login"}>
          <Button className="w-full">{ctaText}</Button>
        </Link>
      )}
    </div>
  );
}
