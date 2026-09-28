import { describe, expect, it } from 'vitest'
import { buildState } from '@/lib/jev/state-builder'
import type { ExtractedFile } from '@/types/file'

const textFile: ExtractedFile = { name: 'memo.txt', kind: 'text', bytes: 10, content: 'file body', extractedChars: 9 }
const jsonFile: ExtractedFile = { name: 'data.json', kind: 'json', bytes: 10, content: { a: 1 }, extractedChars: 7 }

describe('buildState', () => {
  it('テキストのみは文字列（前後の空白を除去）', () => {
    expect(buildState({ text: '  hello  ', textAsJson: false, file: null })).toEqual({
      ok: true,
      value: { state: 'hello', kind: 'text' },
    })
  })

  it('JSON 指定のテキストは値として解釈する', () => {
    expect(buildState({ text: '{"message":"hi"}', textAsJson: true, file: null })).toEqual({
      ok: true,
      value: { state: { message: 'hi' }, kind: 'text-json' },
    })
  })

  it('JSON 指定で構文エラー・数値は拒否する', () => {
    expect(buildState({ text: '{', textAsJson: true, file: null }).ok).toBe(false)
    expect(buildState({ text: '123', textAsJson: true, file: null }).ok).toBe(false)
  })

  it('ファイルのみは抽出内容', () => {
    expect(buildState({ text: '', textAsJson: false, file: textFile })).toEqual({
      ok: true,
      value: { state: 'file body', kind: 'file' },
    })
    expect(buildState({ text: ' ', textAsJson: false, file: jsonFile })).toEqual({
      ok: true,
      value: { state: { a: 1 }, kind: 'file-json' },
    })
  })

  it('両方あれば { text, file } にまとめる', () => {
    expect(buildState({ text: 'note', textAsJson: false, file: textFile })).toEqual({
      ok: true,
      value: { state: { text: 'note', file: { name: 'memo.txt', content: 'file body' } }, kind: 'combined' },
    })
  })

  it('どちらもなければ拒否する', () => {
    expect(buildState({ text: '   ', textAsJson: false, file: null }).ok).toBe(false)
  })

  it('文字数上限を超えると拒否する', () => {
    expect(buildState({ text: 'a'.repeat(200_001), textAsJson: false, file: null }).ok).toBe(false)
  })
})
