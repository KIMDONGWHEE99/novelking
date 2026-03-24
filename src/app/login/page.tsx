"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PenTool, Wand2, BookOpen, Sparkles, Check } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽: 마케팅 패널 (데스크톱만) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 border-r flex-col justify-center px-12">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <PenTool className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">NovelKing</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            아이디어 하나로
            <br />
            소설을 완성하세요
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            글재주가 없어도 괜찮습니다. AI가 시놉시스부터 본문까지 모두 도와줍니다.
          </p>

          <div className="space-y-4">
            <FeatureItem
              icon={<Wand2 className="h-4 w-4" />}
              text="한 줄 아이디어 → 시놉시스/캐릭터/세계관 자동 생성"
            />
            <FeatureItem
              icon={<BookOpen className="h-4 w-4" />}
              text="AI 에디터로 챕터별 본문 작성 및 교정"
            />
            <FeatureItem
              icon={<Sparkles className="h-4 w-4" />}
              text="하루 50회 AI 무료 사용"
            />
          </div>
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-sm w-full space-y-8 text-center">
          {/* 모바일용 로고 */}
          <div className="lg:hidden">
            <PenTool className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold">NovelKing</h1>
            <p className="text-muted-foreground mt-2">
              AI와 함께 당신만의 소설을 쓰세요
            </p>
          </div>

          {/* 데스크톱용 제목 */}
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold">시작하기</h1>
            <p className="text-muted-foreground mt-2">
              Google 계정으로 30초 만에 가입하세요
            </p>
          </div>

          {/* 로그인 버튼 */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google로 시작하기
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-green-500" />
              무료 — 신용카드 불필요
            </div>
            <p className="text-xs text-muted-foreground">
              로그인하면 이용약관과 개인정보처리방침에 동의하는 것으로 간주됩니다.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              NovelKing이 뭔가요? &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="text-sm leading-relaxed">{text}</span>
    </div>
  );
}
