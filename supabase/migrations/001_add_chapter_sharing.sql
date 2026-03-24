-- 챕터 공유 기능을 위한 마이그레이션
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- 1. chapters 테이블에 공유 토큰 컬럼 추가
alter table chapters add column if not exists share_token text unique;

-- 2. 공유 토큰으로 공개 읽기 허용하는 RLS 정책
create policy "Public read via share token"
  on chapters for select
  using (share_token is not null);

-- 3. 프로젝트 제목을 공유 페이지에서 보여주기 위한 공개 읽기 정책
create policy "Public read project by shared chapter"
  on projects for select
  using (
    id in (
      select project_id from chapters where share_token is not null
    )
  );

-- 4. share_token 인덱스
create index if not exists idx_chapters_share_token on chapters(share_token) where share_token is not null;
