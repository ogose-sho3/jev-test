# jev Evaluator

TypeSafe の System One モデル **jev** にテキスト・ファイルと型付きの質問（noul / choice / score）を送り、回答を形式に応じて表示する社内向け Web アプリです。
実行ごとの入出力サイズ・実行時間・トークン消費量を記録します（入出力の内容は保存しません）。ログインは `@sho-san.co.jp` の Google アカウントに限定しています。

- 仕様: [docs/features/jev-evaluator.md](docs/features/jev-evaluator.md)
- セキュリティ: [docs/security.md](docs/security.md)
- 構成: [docs/architecture.md](docs/architecture.md)

構成: Next.js 16（App Router）/ TypeScript / Supabase（Auth + Postgres）/ Vercel / `@typesafe-ai/sdk`

## セットアップ

### 1. 依存関係

```bash
pnpm install
```

### 2. Google OAuth クライアント

Google Cloud Console で「OAuth クライアント ID（ウェブアプリケーション）」を作成し、承認済みリダイレクト URI に Supabase のコールバックを登録します。

- 本番: `https://<project-ref>.supabase.co/auth/v1/callback`
- ローカル: `http://127.0.0.1:54321/auth/v1/callback`

sho-san.co.jp の Google Workspace で作成し、OAuth 同意画面を「内部」にすると、Google 側でもドメイン外のアカウントを拒否できます。

### 3. Supabase

**本番（Supabase プロジェクト）**

1. マイグレーションを適用する: `supabase link --project-ref <ref>` → `supabase db push`
2. Authentication > Sign In / Providers で Google を有効にし、クライアント ID / シークレットを設定する。Email プロバイダは無効にする。
3. Authentication > Hooks で **Before User Created** フックに `public.hook_restrict_signup_email_domain`（Postgres 関数）を設定する。
4. Authentication > URL Configuration の Redirect URLs に `https://<本番ドメイン>/auth/callback` を追加する。

**ローカル**

```bash
cp .env.example .env.local   # 値を記入
supabase start               # supabase/config.toml の設定（Google・フック）で起動
```

ローカルの Google OAuth を使う場合は `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` をシェルの環境変数に設定してから `supabase start` します。

### 4. 環境変数

`.env.example` を参照してください。

| 変数 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase の接続先と publishable キー |
| `APP_BASE_URL` | アプリの公開 URL（Server Component から自 API を呼ぶ基点。未設定時は `VERCEL_URL` → `localhost`） |
| `TYPESAFE_API_KEY` | jev の API キー（[console.typesafe.ai/keys](https://console.typesafe.ai/keys)）。サーバー専用 |

### 5. 起動

```bash
pnpm dev
```

## 開発コマンド

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | 開発サーバー |
| `pnpm build` | 本番ビルド |
| `pnpm typecheck` | 型チェック |
| `pnpm test` | ユニットテスト（Vitest） |

## リポジトリ構成

- `AGENTS.md` — AI 開発の規約・ワークフロー
- `agents/` / `skills/` — 役割別 Agent と作業手順
- `docs/` — 仕様・セキュリティ・設計判断
- `app/` / `components/` / `lib/` / `models/` / `services/` / `types/` — アプリケーション
- `supabase/` — ローカル設定・マイグレーション
- `tests/` — テスト
