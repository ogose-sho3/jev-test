# Tests

Keep project tests here or in the framework's appropriate test locations.

AI chooses unit, integration, and E2E coverage based on the change and risk.

## 構成

- `tests/unit/` — Vitest のユニットテスト（`pnpm test`）。jev・Supabase への通信はモックする。
- `tests/fixtures/` — ファイル抽出テスト用の最小 PDF / Word ファイル。
- `tests/stubs/` — テスト環境用のスタブ（`server-only`）。

DB のマイグレーション・RLS・Auth フックは、ローカル Supabase（`supabase start`）上で実ユーザーの JWT を使って確認する。
