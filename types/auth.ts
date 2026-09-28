/** 認証済みユーザー（許可ドメイン検証済み） */
export type AuthenticatedUser = {
  /** Supabase Auth のユーザーID */
  id: string
  /** メールアドレス */
  email: string
}
