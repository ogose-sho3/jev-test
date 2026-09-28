/**
 * ログインを許可するメールドメイン。
 * DB 側の判定（supabase/migrations の is_allowed_email_domain）と同じ値を保つこと。
 */
export const ALLOWED_EMAIL_DOMAIN = 'sho-san.co.jp'

/** ログイン画面に渡すエラー種別（クエリパラメータ `error`） */
export const loginErrorCodes = {
  forbiddenDomain: 'forbidden_domain',
  oauthFailed: 'oauth_failed',
} as const

/** ログイン画面のエラーメッセージ */
export const loginErrorMessages: Record<string, string> = {
  [loginErrorCodes.forbiddenDomain]: `@${ALLOWED_EMAIL_DOMAIN} のアカウントでログインしてください。`,
  [loginErrorCodes.oauthFailed]: `ログインに失敗しました。@${ALLOWED_EMAIL_DOMAIN} のアカウントを選択しているか確認し、もう一度お試しください。`,
}
