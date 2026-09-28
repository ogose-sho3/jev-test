import type { JevEntry } from '@/types/jev'

const numberFormatter = new Intl.NumberFormat('ja-JP')
const dateTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Tokyo',
})

/** 整数を桁区切りで表示する */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** バイト数を B / KB / MB で表示する */
export function formatBytes(bytes: number | null): string {
  if (bytes === null) {
    return '—'
  }
  if (bytes < 1024) {
    return `${formatNumber(bytes)} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/** ミリ秒を ms / s で表示する */
export function formatDuration(ms: number): string {
  return ms < 1000 ? `${formatNumber(ms)} ms` : `${(ms / 1000).toFixed(2)} s`
}

/** 0〜1 の値をパーセント表示する */
export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}

/** ISO 8601 の日時を日本時間で表示する */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

/** 構造化値を 1 行の表示用文字列にする */
export function entryToLabel(entry: JevEntry | undefined): string {
  if (entry === undefined || entry === null) {
    return ''
  }
  return typeof entry === 'string' ? entry : JSON.stringify(entry)
}
