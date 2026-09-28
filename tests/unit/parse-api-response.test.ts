import { describe, expect, it } from 'vitest'
import { parseApiResponse } from '@/lib/http/parse-api-response'
import { appErrors } from '@/models/errors'

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('parseApiResponse', () => {
  it('成功レスポンスの data を返す', async () => {
    await expect(parseApiResponse(json({ ok: true, status: 200, data: { email: 'a' } }, 200))).resolves.toEqual({
      ok: true,
      status: 200,
      data: { email: 'a' },
    })
  })

  it('Problem Details 形式のエラーを読み取る', async () => {
    const body = {
      type: 'urn:jev-sample:problem:Unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'x',
      ok: false,
      data: { type: 'Unauthorized', message: '認証が必要です。' },
    }
    await expect(parseApiResponse(json(body, 401))).resolves.toEqual({
      ok: false,
      status: 401,
      data: { type: 'Unauthorized', message: '認証が必要です。' },
    })
  })

  it('JSON でない応答は定義済みエラーに置き換える（内部情報を出さない）', async () => {
    const parsed = await parseApiResponse(new Response('<html>Internal</html>', { status: 502 }))
    expect(parsed).toEqual({
      ok: false,
      status: 502,
      data: { type: appErrors.internalServerError.type, message: appErrors.internalServerError.message },
    })
    const tooLarge = await parseApiResponse(new Response('Request Entity Too Large', { status: 413 }))
    expect(tooLarge.data).toMatchObject({ type: appErrors.payloadTooLarge.type })
  })
})
