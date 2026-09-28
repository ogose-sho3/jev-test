import { jevLimits } from '@/models/jev'
import type { ExtractedFile } from '@/types/file'
import type { JevEntry } from '@/types/jev'
import type { StateKind } from '@/types/jev-api'
import type { ValidationResult } from '@/types/validation'

/** state 組み立ての入力 */
type BuildStateInput = {
  /** 入力テキスト */
  text: string
  /** テキストを JSON として解釈するか */
  textAsJson: boolean
  /** アップロードファイルの内容（なしは null） */
  file: ExtractedFile | null
}

/** 組み立てた state */
type BuiltState = {
  /** jev に送る state */
  state: JevEntry
  /** state の構成 */
  kind: StateKind
}

/** jev の state として送れる値（文字列・オブジェクト・配列）かを判定する */
export function isStateValue(value: unknown): value is JevEntry {
  return typeof value === 'string' || (typeof value === 'object' && value !== null)
}

/**
 * テキスト・ファイルから jev の state を組み立てる。
 * - テキストのみ: 文字列（JSON 指定時はその値）
 * - ファイルのみ: 抽出テキスト（JSON ファイルはその値）
 * - 両方: `{ text, file: { name, content } }`（質問から `text` / `file.content` で参照できる）
 */
export function buildState({ text, textAsJson, file }: BuildStateInput): ValidationResult<BuiltState> {
  const trimmedText = text.trim()
  if (trimmedText.length === 0 && !file) {
    return { ok: false, issues: [{ path: 'text', message: 'テキストを入力するか、ファイルを添付してください。' }] }
  }
  if (text.length > jevLimits.maxTextChars) {
    return {
      ok: false,
      issues: [{ path: 'text', message: `テキストは ${jevLimits.maxTextChars.toLocaleString()} 文字以内で入力してください。` }],
    }
  }

  let textValue: JevEntry | null = null
  if (trimmedText.length > 0) {
    if (textAsJson) {
      let parsedText: unknown
      try {
        parsedText = JSON.parse(trimmedText)
      } catch {
        return { ok: false, issues: [{ path: 'text', message: 'テキストが JSON として正しくありません。' }] }
      }
      if (!isStateValue(parsedText)) {
        return { ok: false, issues: [{ path: 'text', message: 'JSON はオブジェクト・配列・文字列のいずれかで入力してください。' }] }
      }
      textValue = parsedText
    } else {
      textValue = trimmedText
    }
  }

  if (textValue !== null && file) {
    return {
      ok: true,
      value: { state: { text: textValue, file: { name: file.name, content: file.content } }, kind: 'combined' },
    }
  }
  if (file) {
    return { ok: true, value: { state: file.content, kind: file.kind === 'json' ? 'file-json' : 'file' } }
  }
  return { ok: true, value: { state: textValue, kind: textAsJson ? 'text-json' : 'text' } }
}
