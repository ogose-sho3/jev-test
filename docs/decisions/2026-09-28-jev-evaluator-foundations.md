# 2026-09-28 jev Evaluator の基盤となる設計判断

## 状況

jev API を使う社内ツールを新規に作るにあたり、プロジェクトの規約（`AGENTS.md`、開発規約）の間で次の点が一意に決まらなかった。

## 決定

### 1. エラーレスポンスは ResponseBase と RFC 9457 を両立させる

`AGENTS.md` は RFC 9457 Problem Details を、開発規約は `ResponseBase<T>`（`{ ok, status, data: { type, message } }`）を求める。
RFC 9457 は拡張メンバーを許すため、トップレベルに `type`（URI 参照: `urn:jev-sample:problem:<種別>`）・`title`・`status`・`detail` を置き、`ok` と `data` を拡張メンバーとして持たせる。Content-Type は `application/problem+json`。

```json
{
  "type": "urn:jev-sample:problem:BadRequest",
  "title": "Bad Request",
  "status": 400,
  "detail": "リクエストの内容が不正です。",
  "ok": false,
  "data": { "type": "BadRequest", "message": "リクエストの内容が不正です。", "details": [{ "path": "questions.q.criteria", "message": "…" }] }
}
```

### 2. Server Component は自 API 経由でデータを取得する

開発規約どおり、Server Component は `services/serverService` → `serverApiClient`（Cookie 転送）→ API ルートの順で取得する。認可・検証・エラー形式を API ルートに集約するため。
サービスの置き場所は、リポジトリ既存の `services/clientService` / `services/serverService` を使う。

### 3. 実行ログはメタデータのみ、ユーザーのセッションで書き込む

要件「データ自体は保持しない」に従い、入出力の内容・ファイル名は保存しない。service role キーは使わず、ユーザーのセッションで INSERT して RLS を常に効かせる。
jev 呼び出し後の失敗（422 / 429 / タイムアウト等）も記録する（コストや失敗傾向の把握に必要なため）。呼び出し前の入力検証エラーは記録しない。

### 4. 許可ドメインの判定を多層で行う

Google の `hd` は UI の絞り込みにすぎないため、Auth フック・OAuth コールバック・proxy・API・RLS で独立に判定する（詳細は `docs/security.md`）。

### 5. jev の呼び出しは公式 JS SDK を使う

429 / 529 のバックオフ・`retry-after` の扱いを SDK に任せる。state・questions の形式はサーバー側で事前に検証してから SDK に渡す。

### 6. `next dev` による AGENTS.md の自動追記を無効化する

Next.js 16.3 の `next dev` は AGENTS.md に Next.js 用のブロックを自動追記する。AGENTS.md はプロジェクトの規約正本のため、`next.config.ts` で `agentRules: false` とする。

## 影響

- エラーを扱うクライアントは `data.type` / `data.message` を読む（`lib/http/parse-api-response.ts`）。
- Vercel の Deployment Protection を有効にする場合、Server Component から自 API への呼び出しが保護に阻まれないよう `APP_BASE_URL` を本番ドメインにするなどの考慮が必要。
