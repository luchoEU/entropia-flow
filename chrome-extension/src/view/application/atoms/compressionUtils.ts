import pako from 'pako'

/**
 * Compression/decompression utilities for items storage
 * Uses pako deflate for efficient storage quota usage
 */
export function compress(json: object): string {
  const jsonString = JSON.stringify(json)
  const compressed = pako.deflate(jsonString, { to: 'string' })
  return Buffer.from(compressed).toString('base64')
}

export function uncompress(compressed: any): any {
  if (!compressed) return compressed
  const compressedData = Buffer.from(compressed, 'base64')
  const uncompressed = pako.inflate(compressedData, { to: 'string' })
  return JSON.parse(uncompressed)
}
