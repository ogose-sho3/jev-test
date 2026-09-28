-- jev API 実行ログ（メタデータのみ）と、許可ドメイン制限。
-- 入力テキスト・ファイル内容・回答内容は保存しない。

-- ---------------------------------------------------------------------------
-- 許可ドメイン判定
-- ---------------------------------------------------------------------------

-- メールアドレスが許可ドメイン（sho-san.co.jp）かを判定する。
-- サブドメイン（例: foo.sho-san.co.jp）や末尾一致の別ドメインは許可しない。
create or replace function public.is_allowed_email_domain(email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(lower(split_part(email, '@', 2)) = 'sho-san.co.jp', false)
    and coalesce(array_length(string_to_array(email, '@'), 1) = 2, false)
$$;

-- 現在のリクエストの JWT が許可ドメインのユーザーかを判定する（RLS 用）。
create or replace function public.is_allowed_domain_user()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.is_allowed_email_domain(auth.jwt() ->> 'email')
$$;

-- Before User Created Auth Hook: 許可ドメイン以外のユーザー作成を拒否する。
-- supabase/config.toml の [auth.hook.before_user_created]（本番はダッシュボード）で有効化する。
create or replace function public.hook_restrict_signup_email_domain(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
begin
  if public.is_allowed_email_domain(event -> 'user' ->> 'email') then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'message', 'このメールアドレスのドメインは利用できません。',
      'http_code', 403
    )
  );
end;
$$;

grant execute on function public.hook_restrict_signup_email_domain(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_restrict_signup_email_domain(jsonb) from authenticated, anon, public;
grant execute on function public.is_allowed_email_domain(text) to supabase_auth_admin, authenticated;
grant execute on function public.is_allowed_domain_user() to authenticated;

-- ---------------------------------------------------------------------------
-- 実行ログ
-- ---------------------------------------------------------------------------

create table public.jev_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- 実行結果
  status text not null check (status in ('success', 'error')),
  error_code text,
  http_status integer,
  -- モデル
  requested_model text not null,
  resolved_model text,
  -- 入力サイズ（バイト）
  question_count integer not null check (question_count >= 0),
  input_text_bytes integer not null check (input_text_bytes >= 0),
  input_file_bytes integer check (input_file_bytes >= 0),
  input_file_kind text check (input_file_kind in ('text', 'json', 'pdf', 'docx')),
  request_bytes integer not null check (request_bytes >= 0),
  -- 出力サイズ（バイト）
  response_bytes integer check (response_bytes >= 0),
  -- 実行時間（ミリ秒）
  jev_duration_ms integer not null check (jev_duration_ms >= 0),
  total_duration_ms integer not null check (total_duration_ms >= 0),
  -- トークン消費量（jev の usage。取得できない場合は null）
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0)
);

comment on table public.jev_executions is 'jev API 実行ごとのメタデータ（入出力サイズ・実行時間・トークン数）。入出力の内容は保存しない。';

create index jev_executions_user_id_created_at_idx
  on public.jev_executions (user_id, created_at desc);

alter table public.jev_executions enable row level security;

-- 本人の実行ログのみ参照できる。
create policy "jev_executions_select_own"
  on public.jev_executions
  for select
  to authenticated
  using (user_id = (select auth.uid()) and (select public.is_allowed_domain_user()));

-- 本人の実行ログのみ追加できる。
create policy "jev_executions_insert_own"
  on public.jev_executions
  for insert
  to authenticated
  with check (user_id = (select auth.uid()) and (select public.is_allowed_domain_user()));

-- 更新・削除ポリシーは定義しない（ログは追記のみ）。
revoke all on public.jev_executions from anon;
revoke update, delete, truncate on public.jev_executions from authenticated;
grant select, insert on public.jev_executions to authenticated;
