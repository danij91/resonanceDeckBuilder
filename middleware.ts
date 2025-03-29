import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ISO 국가 코드 → 언어 코드 매핑
const countryToLanguage: Record<string, string> = {
  KR: "ko",
  US: "en",
  JP: "jp",
  CN: "cn",
  TW: "cn", // 필요시 추가
}

const supportedLanguages = ["en", "ko", "jp", "cn"]
const defaultLanguage = "en"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 이미 언어가 포함된 경로는 그대로 진행
  const pathnameHasLanguage = supportedLanguages.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`,
  )
  if (pathnameHasLanguage) return NextResponse.next()

  // 루트 접근 시 국가 기반 리디렉션 우선
  if (pathname === "/") {
    const countryCode = request.geo?.country || ""
    const countryLang = countryToLanguage[countryCode] || defaultLanguage
    return NextResponse.redirect(new URL(`/${countryLang}`, request.url))
  }

  // 그 외에는 accept-language 기반
  const acceptLanguage = request.headers.get("accept-language")
  let detectedLanguage = defaultLanguage

  if (acceptLanguage) {
    const preferredLanguage = acceptLanguage.split(",")[0].split("-")[0]
    if (supportedLanguages.includes(preferredLanguage)) {
      detectedLanguage = preferredLanguage
    }
  }

  return NextResponse.redirect(new URL(`/${detectedLanguage}${pathname}`, request.url))
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
