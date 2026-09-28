# Architecture

## Baseline

- Next.js App Router + TypeScript.
- Server Components are the default.
- Server Component -> serverService -> data sources.
- Client Component -> clientService -> API -> data sources.
- Client and server service entry points are separate.
- UI does not directly access APIs or databases.
- Repository/DAL is optional and responsibility-driven.

## 構成

```
Browser ──(Client Component)── services/clientService ── apiClient ──┐
                                                                     ▼
Server Component ── services/serverService ── serverApiClient ──▶ app/api/**（認証・入力検証・エラー形式の単一の関門）
                    （Cookie を転送して自 API を呼ぶ）                  │
                                                                     ├─ lib/jev/*          jev 呼び出し・入力変換
                                                                     ├─ lib/executions/*   実行ログ（Supabase, RLS）
                                                                     └─ lib/auth/*         認証・ドメイン判定
proxy.ts ── セッション更新・画面アクセスの振り分け
app/auth/** ── OAuth 開始・コールバック・ログアウト（Route Handler）
```

- ホスティングは Vercel、認証・DB は Supabase、推論は TypeSafe jev（公式 JS SDK）。
- Server Component はデータを API 経由で取得する（`serverApiClient` が Cookie を転送）。認可を API ルートに集約するための意図的な選択（[ADR](decisions/2026-09-28-jev-evaluator-foundations.md)）。
- API のレスポンスは `ResponseBase<T>`（`{ ok, status, data }`）。エラーはこれに RFC 9457 Problem Details のメンバーを加えた `application/problem+json`（同 ADR）。

## 主なディレクトリ

| パス | 役割 |
| --- | --- |
| `app/` | 画面（`page.tsx` → `*-data-loader.tsx` → `*-content.tsx`）と API ルート |
| `components/` | 複数画面で使う UI |
| `services/clientService`, `services/serverService` | 画面から API を呼ぶ入口 |
| `lib/` | API ルートの業務処理、通信クライアント、Supabase クライアント |
| `models/` | エンドポイント・画面遷移先・エラー定義・定数 |
| `types/` | 型定義 |
| `supabase/` | ローカル設定・マイグレーション |
| `tests/` | ユニットテスト（Vitest） |
