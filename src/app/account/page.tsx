"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, User, Zap, LogOut, CreditCard } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: string;
  aiCreditsUsed: number;
  aiCreditsResetAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, plan, ai_credits_used, ai_credits_reset_at")
        .eq("id", user.id)
        .single();

      if (data) {
        // 하루가 지났으면 사용량을 0으로 표시
        const resetAt = new Date(data.ai_credits_reset_at);
        const now = new Date();
        const creditsUsed =
          resetAt.toDateString() !== now.toDateString() ? 0 : data.ai_credits_used;

        setProfile({
          displayName: data.display_name || user.email?.split("@")[0] || "사용자",
          email: user.email || "",
          avatarUrl: data.avatar_url,
          plan: data.plan || "free",
          aiCreditsUsed: creditsUsed,
          aiCreditsResetAt: data.ai_credits_reset_at,
        });
      }
      setIsLoading(false);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const dailyLimit = profile?.plan === "free" ? 50 : Infinity;
  const usagePercent =
    dailyLimit === Infinity ? 0 : ((profile?.aiCreditsUsed ?? 0) / dailyLimit) * 100;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold">내 계정</h1>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">로딩 중...</div>
        ) : !profile ? (
          <div className="text-center py-20 text-muted-foreground">
            프로필 정보를 불러올 수 없습니다.
          </div>
        ) : (
          <>
            {/* 프로필 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">프로필</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-lg">{profile.displayName}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 요금제 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">요금제</CardTitle>
                    <CardDescription>현재 사용 중인 요금제</CardDescription>
                  </div>
                  <Badge
                    variant={profile.plan === "pro" ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {profile.plan === "pro" ? "Pro" : "Free"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {profile.plan === "pro"
                      ? "AI 사용 무제한, 모든 모델 사용 가능"
                      : "하루 50회 AI 사용, 기본 모델"}
                  </p>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />
                      요금제 보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* AI 사용량 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI 사용량
                </CardTitle>
                <CardDescription>오늘의 AI 사용량</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.plan === "pro" ? (
                  <p className="text-sm text-muted-foreground">
                    Pro 플랜은 AI 사용 제한이 없습니다.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">사용량</span>
                      <span className="font-medium">
                        {profile.aiCreditsUsed} / {dailyLimit}회
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent >= 90
                            ? "bg-red-500"
                            : usagePercent >= 70
                            ? "bg-yellow-500"
                            : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      매일 자정에 사용량이 초기화됩니다
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* 로그아웃 */}
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
