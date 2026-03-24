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
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
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
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
      </section>

      {/* 3단계 플로우 */}
      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            3단계로 소설 완성
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            아이디어만 있으면 됩니다. 나머지는 AI가 해줍니다.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              icon={<Wand2 className="h-6 w-6" />}
              title="아이디어 입력"
              description='소설 마법사에 한 줄만 입력하세요. "우주 정거장에서 일어나는 미스터리 스릴러" — 이것만으로 충분합니다.'
            />
            <StepCard
              step={2}
              icon={<Sparkles className="h-6 w-6" />}
              title="AI 자동 생성"
              description="시놉시스, 캐릭터 프로필, 세계관 설정, 챕터별 플롯이 자동으로 만들어집니다."
            />
            <StepCard
              step={3}
              icon={<BookOpen className="h-6 w-6" />}
              title="소설 완성"
              description="AI 에디터로 챕터별 본문을 작성하고, 문체를 교정하고, 원하는 스타일로 변환하세요."
            />
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
              icon={<Sparkles className="h-5 w-5" />}
              title="브레인스토밍"
              description="AI 채팅으로 아이디어를 발전시키고 막힌 부분을 해결"
            />
          </div>
        </div>
      </section>

      {/* 요금제 미리보기 */}
      <section className="py-20 border-t bg-muted/30">
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
      <section className="py-20 border-t">
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

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <div className="text-xs font-medium text-muted-foreground mb-2">
        STEP {step}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

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
