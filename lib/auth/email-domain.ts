import { ALLOWED_EMAIL_DOMAIN } from '@/models/auth'

/**
 * メールアドレスが許可ドメインのものかを判定する。
 * サブドメインや末尾が一致するだけの別ドメイン（例: evil-sho-san.co.jp）は許可しない。
 */
export function isAllowedEmail(email: unknown): boolean {
  if (typeof email !== 'string') {
    return false
  }
  const parts = email.trim().toLowerCase().split('@')
  if (parts.length !== 2) {
    return false
  }
  const [localPart, domain] = parts
  if (!localPart) {
    return false
  }
  return domain === ALLOWED_EMAIL_DOMAIN
}
