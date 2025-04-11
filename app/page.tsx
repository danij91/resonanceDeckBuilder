/*
  Resonance Deck Builder
  Copyright (C) 2025 Heeyong Chang

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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

