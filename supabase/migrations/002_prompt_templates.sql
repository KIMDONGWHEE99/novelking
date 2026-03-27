-- 프롬프트 템플릿 테이블
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,        -- 'wizard', 'write', 'transform', 'brainstorm', 'review', 'genre'
  subcategory TEXT NOT NULL,     -- 'synopsis', 'characters', 'world', 'plot', 장르명, 변환유형 등
  name TEXT NOT NULL,            -- 표시용 이름
  content TEXT NOT NULL,         -- 프롬프트 전문
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 카테고리+서브카테고리 조합에 유니크 인덱스 (active 프롬프트만)
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_templates_unique
  ON prompt_templates (category, subcategory) WHERE is_active = true;

-- 관리자만 접근 가능 RLS
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- 관리자 user_id
CREATE POLICY "Admin full access on prompt_templates"
  ON prompt_templates FOR ALL
  USING (auth.uid() = '5276608a-63a6-4b5f-870a-5f5e19274a6c')
  WITH CHECK (auth.uid() = '5276608a-63a6-4b5f-870a-5f5e19274a6c');

-- 서버 측에서도 읽기 가능 (AI 라우트에서 프롬프트 로드용)
CREATE POLICY "Server read prompt_templates"
  ON prompt_templates FOR SELECT
  USING (is_active = true);
