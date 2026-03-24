"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Check, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "",
    description: "소설 창작을 시작해보세요",
    icon: Sparkles,
    features: [
      "AI 소설 변환/작성/교정",
      "하루 50회 AI 사용",
      "Claude Sonnet 4.6 모델",
      "프로젝트 무제한 생성",
      "캐릭터/세계관/플롯 관리",
      "TXT/HTML 내보내기",
    ],
    limitations: [
      "일일 AI 사용 제한 (50회)",
    ],
    buttonText: "현재 플랜",
    buttonDisabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "9,900",
    period: "/월",
    description: "제한 없이 마음껏 창작하세요",
    icon: Zap,
    features: [
      "Free의 모든 기능 포함",
      "AI 사용 무제한",
      "Claude Opus 4.6 모델 사용 가능",
      "우선 응답 처리",
      "향후 추가 기능 우선 제공",
    ],
    limitations: [],
    buttonText: "준비 중 (곧 출시)",
    buttonDisabled: true,
  },
];

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<string>("free");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      if (data?.plan) setCurrentPlan(data.plan);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">요금제</h1>
          <p className="text-muted-foreground">
            AI와 함께 소설을 창작하세요. 무료로 시작하고, 필요할 때 업그레이드하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isPro = plan.id === "pro";

            return (
              <Card
                key={plan.id}
                className={`relative ${isPro ? "border-primary shadow-lg" : ""}`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      추천
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <plan.icon className={`h-6 w-6 ${isPro ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-lg">원</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isPro ? "default" : "outline"}
                    disabled={plan.buttonDisabled}
                  >
                    {isCurrent ? "현재 플랜" : plan.buttonText}
                  </Button>

                  {isCurrent && (
                    <p className="text-center text-xs text-muted-foreground">
                      현재 사용 중인 요금제입니다
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>결제 기능은 현재 준비 중입니다. 곧 토스페이먼츠를 통해 결제가 가능해집니다.</p>
        </div>
      </main>
    </div>
  );
}
