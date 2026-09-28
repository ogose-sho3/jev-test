import { describe, expect, it } from 'vitest'
import { isAllowedEmail } from '@/lib/auth/email-domain'

describe('isAllowedEmail', () => {
  it.each(['taro@sho-san.co.jp', 'Taro.Yamada@SHO-SAN.CO.JP', ' hanako@sho-san.co.jp '])('許可ドメインを受け付ける: %s', (email) => {
    expect(isAllowedEmail(email)).toBe(true)
  })

  it.each([
    'taro@gmail.com',
    'taro@evil-sho-san.co.jp',
    'taro@sub.sho-san.co.jp',
    'taro@sho-san.co.jp.evil.com',
    'taro@sho-san.co.jp@evil.com',
    '@sho-san.co.jp',
    'sho-san.co.jp',
    '',
  ])('許可ドメイン以外を拒否する: %s', (email) => {
    expect(isAllowedEmail(email)).toBe(false)
  })

  it('文字列以外を拒否する', () => {
    expect(isAllowedEmail(undefined)).toBe(false)
    expect(isAllowedEmail(null)).toBe(false)
    expect(isAllowedEmail(123)).toBe(false)
  })
})
