/** API ルートの共通プレフィックス（proxy は API をリダイレクト対象から外す） */
export const apiPathPrefix = '/api/'

export const endpoints = {
  me: '/api/me',
  jev: {
    evaluate: '/api/jev/evaluate',
  },
  executions: {
    list: '/api/executions',
  },
} as const
