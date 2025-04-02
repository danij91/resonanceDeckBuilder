import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 지원하는 언어 목록
const supportedLanguages = ["en", "ko", "jp", "cn"]
const defaultLanguage = "en"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams.toString()
  const queryString = searchParams ? `?${searchParams}` : ""

  // 이미 언어 경로가 있는지 확인
  const pathnameHasLanguage = supportedLanguages.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`,
  )

  if (pathnameHasLanguage) return NextResponse.next()

  // 브라우저의 언어 설정 감지
  const acceptLanguage = request.headers.get("accept-language") || ""
  let detectedLanguage = defaultLanguage

  if (acceptLanguage) {
    // 브라우저 언어 설정에서 우선 순위가 높은 언어 추출
    const browserLanguages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [language, weight] = lang.trim().split(";q=")
        return {
          code: language.split("-")[0], // 'en-US' -> 'en'
          weight: weight ? Number.parseFloat(weight) : 1.0,
        }
      })
      .sort((a, b) => b.weight - a.weight) // 가중치 기준 내림차순 정렬

    // 지원하는 언어 중 가장 우선순위가 높은 언어 찾기
    for (const lang of browserLanguages) {
      if (supportedLanguages.includes(lang.code)) {
        detectedLanguage = lang.code
        break
      }
    }
  }

  // 루트 경로 접근 시 감지된 언어로 리다이렉트
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${detectedLanguage}${queryString}`, request.url))
  }

  // 다른 경로에 접근할 때도 감지된 언어 적용하여 리다이렉트
  return NextResponse.redirect(new URL(`/${detectedLanguage}${pathname}${queryString}`, request.url))
}

export const config = {
  matcher: [
    // 내부 경로(_next, api 등) 제외
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

