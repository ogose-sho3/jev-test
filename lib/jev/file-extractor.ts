import 'server-only'

import mammoth from 'mammoth'
import { extractText, getDocumentProxy } from 'unpdf'
import { isStateValue } from '@/lib/jev/state-builder'
import { appErrors } from '@/models/errors'
import { jevLimits } from '@/models/jev'
import type { AppError } from '@/types/api'
import type { ExtractedFile } from '@/types/file'
import type { InputFileKind } from '@/types/jev'

/** ファイル入力の処理失敗（ユーザーに返すエラー種別を持つ） */
export class FileInputError extends Error {
  readonly appError: AppError

  constructor(appError: AppError, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'FileInputError'
    this.appError = appError
  }
}

const textExtensions = ['.txt', '.md', '.csv', '.tsv']

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ''
}

function startsWithBytes(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte)
}

/** 拡張子と先頭バイトからファイル種別を判定する（Content-Type はクライアント申告のため使わない） */
export function detectFileKind(fileName: string, bytes: Uint8Array): InputFileKind | null {
  const extension = getExtension(fileName)
  if (extension === '.pdf') {
    return startsWithBytes(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]) ? 'pdf' : null // "%PDF-"
  }
  if (extension === '.docx') {
    return startsWithBytes(bytes, [0x50, 0x4b, 0x03, 0x04]) ? 'docx' : null // ZIP
  }
  if (extension === '.json') {
    return 'json'
  }
  if (textExtensions.includes(extension)) {
    return 'text'
  }
  return null
}

/** テキストファイルを復号する（UTF-8 を優先し、失敗時は Shift_JIS を試す） */
export function decodeTextBytes(bytes: Uint8Array): string {
  if (bytes.includes(0)) {
    throw new FileInputError(appErrors.fileExtractionFailed, 'text file contains NUL bytes')
  }
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)
  } catch {
    try {
      return new TextDecoder('shift_jis', { fatal: true }).decode(bytes)
    } catch (decodeError) {
      throw new FileInputError(appErrors.fileExtractionFailed, 'text file is neither UTF-8 nor Shift_JIS', {
        cause: decodeError,
      })
    }
  }
}

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(bytes)
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}

async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const extracted = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
  return extracted.value
}

/**
 * アップロードされたファイルを jev の state に使える値へ変換する。
 * PDF / Word はテキストを抽出し、JSON は構造化値として解釈する。
 */
export async function extractFile(file: File): Promise<ExtractedFile> {
  if (file.size === 0) {
    throw new FileInputError(appErrors.badRequest, 'empty file')
  }
  if (file.size > jevLimits.maxFileBytes) {
    throw new FileInputError(appErrors.payloadTooLarge, 'file too large')
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const kind = detectFileKind(file.name, bytes)
  if (!kind) {
    throw new FileInputError(appErrors.unsupportedFile, 'unsupported file type')
  }

  let text: string
  try {
    if (kind === 'pdf') {
      text = await extractPdfText(bytes)
    } else if (kind === 'docx') {
      text = await extractDocxText(bytes)
    } else {
      text = decodeTextBytes(bytes)
    }
  } catch (extractError) {
    if (extractError instanceof FileInputError) {
      throw extractError
    }
    throw new FileInputError(appErrors.fileExtractionFailed, `failed to extract ${kind} file`, { cause: extractError })
  }

  text = text.replace(/^﻿/, '').trim()
  if (text.length === 0) {
    // スキャン画像のみの PDF などはテキストが取れない
    throw new FileInputError(appErrors.fileExtractionFailed, `no text extracted from ${kind} file`)
  }
  if (text.length > jevLimits.maxExtractedChars) {
    throw new FileInputError(appErrors.payloadTooLarge, 'extracted text too long')
  }

  if (kind === 'json') {
    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(text)
    } catch (parseError) {
      throw new FileInputError(appErrors.fileExtractionFailed, 'invalid json file', { cause: parseError })
    }
    if (!isStateValue(parsedJson)) {
      throw new FileInputError(appErrors.fileExtractionFailed, 'json file must be an object, array or string')
    }
    return { name: file.name, kind, bytes: file.size, content: parsedJson, extractedChars: text.length }
  }
  return { name: file.name, kind, bytes: file.size, content: text, extractedChars: text.length }
}
