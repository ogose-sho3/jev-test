# Security Policy

## Baseline

- Never trust client-controlled input.
- Validate external input server-side.
- Enforce authentication and authorization at each relevant server entry path.
- Protect sensitive data with appropriate database/data-layer controls.
- Do not expose secrets, stack traces, or unnecessary internal details to clients.
- Do not log passwords, tokens, secrets, or unnecessary personal information.

## 認証・認可

- 認証は Supabase Auth の **Google OAuth のみ**（メールでのサインアップは無効）。独自のパスワード保存・セッション管理は行わない。
- 利用できるのは **`@sho-san.co.jp` のメールアドレスのみ**。サブドメインや末尾が一致するだけの別ドメインは不可。判定は次の各層で独立に行う。
  1. **Auth フック**（`public.hook_restrict_signup_email_domain`, Before User Created）: ドメイン外のユーザー作成を拒否する。
  2. **OAuth コールバック**（`/auth/callback`）: セッション交換後にメールを検証し、ドメイン外ならサインアウトする。
  3. **proxy**（`proxy.ts`）: 画面アクセス時に JWT を検証（`getClaims`）し、未ログインはログイン画面へ、ドメイン外はサインアウトしてログイン画面へ送る。
  4. **API ルート**（`requireApiUser`）: Auth サーバーに問い合わせる `getUser` でユーザーを確認し、ドメインを検証する。401 / 403 を返す。
- Google の `hd` パラメータはアカウント選択画面の絞り込みにすぎず、許可判定には使わない。
- Supabase の管理 API（service role）でのユーザー作成は Auth フックを通らない。管理 API で許可ドメイン外のユーザーを作らないこと（作られても 2〜4 と RLS で利用はできない）。

## データアクセス

- `jev_executions` は RLS 有効。`authenticated` ロールに対し、**本人（`user_id = auth.uid()`）かつ許可ドメインの JWT** の行のみ SELECT / INSERT を許可する。UPDATE / DELETE は権限自体を与えない。`anon` は権限なし。
- アプリは service role キーを使わず、ログイン中ユーザーのセッションで DB にアクセスする（RLS が常に効く）。
- 入力テキスト・ファイル内容・ファイル名・回答内容は保存しない。

## 外部サービス

- `TYPESAFE_API_KEY` はサーバーの環境変数のみで扱い、ブラウザへは渡さない（SDK もブラウザからの実行を拒否する）。
- jev のエラー本文には入力内容が含まれうるため、サーバーログには SDK エラーの要約（種別・ステータス・リクエストID・メッセージ）のみ記録する。
- ユーザーに返す jev のエラー詳細は、入力検証エラー（400 / 422）の「項目: 理由」のみ。認証エラーや 5xx の内部情報は返さない。

## 入力の取り扱い

- ファイル形式は Content-Type（クライアント申告）ではなく、拡張子と先頭バイトで判定する。
- PDF は `unpdf`、Word は `mammoth`（外部ファイル参照なし）でテキストのみ抽出する。
- リクエストサイズ・テキスト長・質問数などの上限はサーバー側で検証する（[jev-evaluator.md](features/jev-evaluator.md)）。
- 状態を変える操作（評価実行・ログイン開始・ログアウト）は POST のみ。セッション Cookie は SameSite=Lax のため、他サイトからの POST には送られない。
