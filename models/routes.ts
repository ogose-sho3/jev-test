export const routes = {
  home: '/',
  history: '/history',
  login: '/login',
  auth: {
    login: '/auth/login',
    callback: '/auth/callback',
    signOut: '/auth/sign-out',
  },
} as const

/** 未ログインでも表示できるパス（前方一致） */
export const publicPathPrefixes = [routes.login, '/auth/'] as const
