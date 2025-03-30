import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Supported languages
const supportedLanguages = ["en", "ko", "jp", "cn"]
const defaultLanguage = "en"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams.toString()
  const queryString = searchParams ? `?${searchParams}` : ""

  // Check if the pathname already includes a language
  const pathnameHasLanguage = supportedLanguages.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`,
  )

  if (pathnameHasLanguage) return NextResponse.next()

  // 브라우저의 언어 코드 감지
  const acceptLanguage = request.headers.get("accept-language")
  let detectedLanguage = defaultLanguage

  if (acceptLanguage) {
    // Extract language code (e.g., 'en-US' -> 'en')
    const preferredLanguage = acceptLanguage.split(",")[0].split("-")[0]

    if (supportedLanguages.includes(preferredLanguage)) {
      detectedLanguage = preferredLanguage
    }
  }

  // Redirect to default language if accessing root
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${detectedLanguage}${queryString}`, request.url))
  }

  // 다른 경로에 접근할 때도 쿼리 파라미터 유지
  return NextResponse.redirect(new URL(`/${detectedLanguage}${pathname}${queryString}`, request.url))
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

