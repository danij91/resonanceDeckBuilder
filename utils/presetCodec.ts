import pako from "pako"

// base64 → JSON
export function decodePreset(base64: string): any {
  try {
    const cleaned = base64.replace(/\s+/g, "").trim() // ← 공백/줄바꿈 제거
    const compressed = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0))
    const jsonStr = new TextDecoder().decode(pako.inflateRaw(compressed))
    const result = JSON.parse(jsonStr)
    return result
  } catch (e) {
    console.error("디코딩 실패:", e)
    return null
  }
}

// JSON → base64
export function encodePreset(json: any): string {
  try {
    const jsonStr = JSON.stringify(json)
    const deflated = pako.deflateRaw(new TextEncoder().encode(jsonStr))
    const base64 = btoa(String.fromCharCode(...deflated))
    return base64
  } catch (e) {
    console.error("인코딩 실패:", e)
    return ""
  }
}

