import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // AGENTS.md はプロジェクトの規約正本のため、next dev による自動追記を無効化する
  agentRules: false,
  // PDF / Word のテキスト抽出ライブラリはバンドルせず Node.js から直接読み込む
  serverExternalPackages: ['unpdf', 'mammoth'],
}

export default nextConfig
