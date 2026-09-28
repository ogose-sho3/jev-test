const encoder = new TextEncoder()

/** 文字列の UTF-8 バイト数を返す */
export function utf8ByteLength(text: string): number {
  return encoder.encode(text).byteLength
}
