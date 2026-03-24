-- NovelKing Supabase 스키마
-- Supabase 대시보드 > SQL Editor에서 이 파일을 실행하세요

-- 1. 사용자 프로필
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'basic', 'pro')),
  ai_credits_used int default 0,
  ai_credits_reset_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. 프로젝트
create table if not exists projects (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text default '',
  genre text default '',
  cover_image text,
  settings jsonb default '{"defaultLlmProvider":"openai","defaultLlmModel":"gpt-4o-mini","writingStyle":"대중소설"}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. 챕터
create table if not exists chapters (
  id text primary key,
  project_id text references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text default '',
  raw_draft text default '',
  word_count int default 0,
  "order" int default 0,
  status text default 'draft' check (status in ('draft','writing','ai-transformed','editing','complete')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. 캐릭터
create table if not exists characters (
  id text primary key,
  project_id text references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  role text default '',
  profile_image text,
  illustration_image text,
  tags text[] default '{}',
  world_element_ids text[] default '{}',
  description text default '',
  traits jsonb default '[]'::jsonb,
  backstory text default '',
  relationships jsonb default '[]'::jsonb,
  generated_content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. 세계관 요소
create table if not exists world_elements (
  id text primary key,
  project_id text references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('setting','location','magic-system','culture','history','custom')),
  title text not null,
  content text default '',
  fields jsonb default '[]'::jsonb,
  generated_content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. 플롯 열
create table if not exists plot_columns (
  id text primary key,
  project_id text references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  "order" int default 0,
  color text default '#3b82f6'
);

-- 7. 플롯 카드
create table if not exists plot_cards (
  id text primary key,
  project_id text references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  column_id text references plot_columns on delete cascade not null,
  title text not null,
  description text default '',
  chapter_link text,
  character_links text[] default '{}',
  "order" int default 0,
  color text
);

-- 8. 채팅 세션
create table if not exists chat_sessions (
  id text primary key,
  project_id text references projects on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text default '새 대화',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. 채팅 메시지
create table if not exists chat_messages (
  id text primary key,
  session_id text references chat_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- 10. AI 사용 로그 (품질 개선 + 사용량 추적)
create table if not exists ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  action text not null,
  input_summary text,
  output_summary text,
  feedback text check (feedback in ('good', 'bad', null)),
  model text,
  tokens_used int default 0,
  created_at timestamptz default now()
);

-- ==========================================
-- Row Level Security (RLS) - 행 수준 보안
-- 각 사용자는 자기 데이터만 접근 가능
-- ==========================================

alter table profiles enable row level security;
alter table projects enable row level security;
alter table chapters enable row level security;
alter table characters enable row level security;
alter table world_elements enable row level security;
alter table plot_columns enable row level security;
alter table plot_cards enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table ai_logs enable row level security;

-- profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- projects
create policy "Users can CRUD own projects" on projects for all using (auth.uid() = user_id);

-- chapters
create policy "Users can CRUD own chapters" on chapters for all using (auth.uid() = user_id);

-- characters
create policy "Users can CRUD own characters" on characters for all using (auth.uid() = user_id);

-- world_elements
create policy "Users can CRUD own world_elements" on world_elements for all using (auth.uid() = user_id);

-- plot_columns
create policy "Users can CRUD own plot_columns" on plot_columns for all using (auth.uid() = user_id);

-- plot_cards
create policy "Users can CRUD own plot_cards" on plot_cards for all using (auth.uid() = user_id);

-- chat_sessions
create policy "Users can CRUD own chat_sessions" on chat_sessions for all using (auth.uid() = user_id);

-- chat_messages
create policy "Users can CRUD own chat_messages" on chat_messages for all using (auth.uid() = user_id);

-- ai_logs
create policy "Users can insert own logs" on ai_logs for insert with check (auth.uid() = user_id);
create policy "Users can view own logs" on ai_logs for select using (auth.uid() = user_id);

-- ==========================================
-- 인덱스 (성능 최적화)
-- ==========================================

create index if not exists idx_projects_user on projects(user_id);
create index if not exists idx_chapters_project on chapters(project_id);
create index if not exists idx_characters_project on characters(project_id);
create index if not exists idx_world_elements_project on world_elements(project_id);
create index if not exists idx_plot_columns_project on plot_columns(project_id);
create index if not exists idx_plot_cards_column on plot_cards(column_id);
create index if not exists idx_chat_sessions_project on chat_sessions(project_id);
create index if not exists idx_chat_messages_session on chat_messages(session_id);
create index if not exists idx_ai_logs_user on ai_logs(user_id, created_at);

-- ==========================================
-- 자동 프로필 생성 트리거
-- 새 사용자가 가입하면 profiles 테이블에 자동 추가
-- ==========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 트리거 (이미 존재하면 삭제 후 재생성)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
