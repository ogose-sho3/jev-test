import {
  APIConnectionError,
  APIError,
  APITimeoutError,
  AuthenticationError,
  InternalServerError,
  RateLimitError,
  UnprocessableEntityError,
} from '@typesafe-ai/sdk'
import { describe, expect, it } from 'vitest'
import { mapJevError } from '@/lib/jev/jev-gateway'
import { appErrors } from '@/models/errors'

const headers = new Headers()

describe('mapJevError', () => {
  it('422 は入力エラーとして補足を返す', () => {
    const mapped = mapJevError(
      new UnprocessableEntityError(422, { detail: [{ loc: ['body', 'questions', 'q', 'criteria'], msg: 'field required' }] }, headers),
    )
    expect(mapped.appError).toBe(appErrors.jevRejected)
    expect(mapped.httpStatus).toBe(422)
    expect(mapped.details).toContain('questions.q.criteria: field required')
  })

  it('429 / 529 は利用上限', () => {
    expect(mapJevError(new RateLimitError(429, undefined, headers)).appError).toBe(appErrors.jevRateLimited)
    expect(mapJevError(new APIError(529, undefined, headers)).appError).toBe(appErrors.jevRateLimited)
  })

  it('401 は詳細を出さず呼び出し失敗として扱う', () => {
    const mapped = mapJevError(new AuthenticationError(401, { error: 'invalid key' }, headers))
    expect(mapped.appError).toBe(appErrors.jevUnavailable)
    expect(mapped.details).toBeUndefined()
  })

  it('5xx・通信失敗・タイムアウト', () => {
    expect(mapJevError(new InternalServerError(500, undefined, headers)).appError).toBe(appErrors.jevUnavailable)
    expect(mapJevError(new APIConnectionError()).appError).toBe(appErrors.jevUnavailable)
    expect(mapJevError(new APITimeoutError(20_000)).appError).toBe(appErrors.jevTimeout)
    expect(mapJevError(new Error('boom')).appError).toBe(appErrors.internalServerError)
  })
})
