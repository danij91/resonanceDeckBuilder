"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import DeckBuilder from "../../components/deckBuilder"
import { LoadingScreen } from "../../components/loading-screen"
import { use } from 'react'

// Firebase Analytics 관련 import
import { analytics, logEvent } from "../../lib/firebase-config" // 경로는 프로젝트 구조에 맞게 조정

interface PageProps {
  params: {
    lang: string
  }
}

export default function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params) || "ko"
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [deckCode, setDeckCode] = useState<string | null>(null)

  useEffect(() => {
    // URL에서 code 파라미터 추출
    const codeParam = searchParams.get("code")
    if (codeParam) {
      setDeckCode(codeParam)
    }

    setIsLoading(false)

    // Firebase Analytics 이벤트 전송
    if (analytics && typeof window !== "undefined") {
      logEvent(analytics, "page_view", {
        page_path: pathname,
        language: lang,
      })
    }
  }, [searchParams, pathname, lang])

  if (isLoading) {
    return <LoadingScreen message="Loading..." />
  }

  return <DeckBuilder lang={lang} urlDeckCode={deckCode} />
}
