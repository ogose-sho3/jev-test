import type { InputFileKind, JevEntry } from '@/types/jev'

/** アップロードファイルから取り出した内容 */
export type ExtractedFile = {
  /** ファイル名（jev の state に含める。ログには保存しない） */
  name: string
  /** ファイル種別 */
  kind: InputFileKind
  /** 元ファイルのサイズ（バイト） */
  bytes: number
  /** state に使う内容（テキスト、または JSON ファイルの値） */
  content: JevEntry
  /** 抽出したテキストの文字数 */
  extractedChars: number
}
