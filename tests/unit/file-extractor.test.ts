import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { decodeTextBytes, detectFileKind, extractFile, FileInputError } from '@/lib/jev/file-extractor'
import { appErrors } from '@/models/errors'

const fixture = (name: string) => fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url))

async function fixtureFile(name: string): Promise<File> {
  return new File([await readFile(fixture(name))], name)
}

async function expectFileError(file: File, expected: (typeof appErrors)[keyof typeof appErrors]) {
  const extraction = extractFile(file)
  await expect(extraction).rejects.toBeInstanceOf(FileInputError)
  await extraction.catch((fileError: FileInputError) => {
    expect(fileError.appError).toBe(expected)
  })
}

describe('detectFileKind', () => {
  it('拡張子と先頭バイトで判定する', () => {
    expect(detectFileKind('a.pdf', new TextEncoder().encode('%PDF-1.4'))).toBe('pdf')
    expect(detectFileKind('a.docx', new Uint8Array([0x50, 0x4b, 0x03, 0x04]))).toBe('docx')
    expect(detectFileKind('A.JSON', new Uint8Array())).toBe('json')
    expect(detectFileKind('a.csv', new Uint8Array())).toBe('text')
  })

  it('拡張子と中身が一致しない・未対応の形式は null', () => {
    expect(detectFileKind('a.pdf', new TextEncoder().encode('hello'))).toBeNull()
    expect(detectFileKind('a.docx', new TextEncoder().encode('%PDF-'))).toBeNull()
    expect(detectFileKind('a.exe', new Uint8Array())).toBeNull()
    expect(detectFileKind('noext', new Uint8Array())).toBeNull()
  })
})

describe('decodeTextBytes', () => {
  it('UTF-8（BOM 付き含む）を復号する', () => {
    expect(decodeTextBytes(new TextEncoder().encode('こんにちは'))).toBe('こんにちは')
    expect(decodeTextBytes(new Uint8Array([0xef, 0xbb, 0xbf, 0x61]))).toBe('a')
  })

  it('Shift_JIS を復号する', () => {
    // 「日本」の Shift_JIS
    expect(decodeTextBytes(new Uint8Array([0x93, 0xfa, 0x96, 0x7b]))).toBe('日本')
  })

  it('バイナリ（NUL を含む）は拒否する', () => {
    expect(() => decodeTextBytes(new Uint8Array([0x61, 0x00, 0x62]))).toThrow(FileInputError)
  })
})

describe('extractFile', () => {
  it('テキストファイルを読み取る', async () => {
    const extracted = await extractFile(new File(['  hello  \n'], 'memo.txt'))
    expect(extracted).toMatchObject({ kind: 'text', content: 'hello', extractedChars: 5 })
  })

  it('JSON ファイルを構造化値として読み取る', async () => {
    const extracted = await extractFile(new File(['{"message":"hi"}'], 'data.json'))
    expect(extracted).toMatchObject({ kind: 'json', content: { message: 'hi' } })
  })

  it('PDF からテキストを抽出する', async () => {
    const extracted = await extractFile(await fixtureFile('sample.pdf'))
    expect(extracted.kind).toBe('pdf')
    expect(extracted.content).toContain('Hello from PDF')
  })

  it('Word（docx）からテキストを抽出する', async () => {
    const extracted = await extractFile(await fixtureFile('sample.docx'))
    expect(extracted.kind).toBe('docx')
    expect(extracted.content).toContain('Hello from Word')
    expect(extracted.content).toContain('請求が二重です')
  })

  it('不正な入力を種別付きで拒否する', async () => {
    await expectFileError(new File([''], 'empty.txt'), appErrors.badRequest)
    await expectFileError(new File(['x'], 'a.exe'), appErrors.unsupportedFile)
    await expectFileError(new File(['not pdf'], 'a.pdf'), appErrors.unsupportedFile)
    await expectFileError(new File(['{'], 'a.json'), appErrors.fileExtractionFailed)
    await expectFileError(new File(['123'], 'a.json'), appErrors.fileExtractionFailed)
    await expectFileError(new File(['   '], 'blank.txt'), appErrors.fileExtractionFailed)
    await expectFileError(new File(['%PDF-1.4 broken'], 'broken.pdf'), appErrors.fileExtractionFailed)
    await expectFileError(new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'big.txt'), appErrors.payloadTooLarge)
  })
})
