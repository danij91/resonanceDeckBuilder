import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default function Home() {
  // 브라우저의 언어 코드 감지
  const headersList = headers()
  const acceptLanguage = headersList.get("accept-language") || ""

  // 지원하는 언어 목록
  const supportedLanguages = ["en", "ko", "jp", "cn"]
  const defaultLanguage = "en"

  // 브라우저 언어 코드 추출 (예: 'en-US' -> 'en')
  const preferredLanguage = acceptLanguage.split(",")[0].split("-")[0]

  // 지원하는 언어인지 확인
  const detectedLanguage = supportedLanguages.includes(preferredLanguage) ? preferredLanguage : defaultLanguage

  // 감지된 언어로 리다이렉트
  redirect(`/${detectedLanguage}`)
}

