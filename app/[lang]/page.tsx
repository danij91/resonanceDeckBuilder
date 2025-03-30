"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import DeckBuilder from "../../components/deckBuilder"
import { LoadingScreen } from "../../components/loading-screen"
import { use } from 'react';

interface PageProps {
  params: {
    lang: string
  }
}

export default function Page({ params }: { params: Promise<{ lang: string }> }) {
  // 직접 params.lang 사용 (use() 함수 제거)
  const {lang} = use(params) || "ko";
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [deckCode, setDeckCode] = useState<string | null>(null)

  useEffect(() => {
    // URL에서 code 파라미터 추출
    const codeParam = searchParams.get("code")

    if (codeParam) {
      // URL에서 가져온 코드 저장
      setDeckCode(codeParam)
    }

    setIsLoading(false)
  }, [searchParams])

  if (isLoading) {
    return <LoadingScreen message="Loading..." />
  }

  return <DeckBuilder lang={lang} urlDeckCode={deckCode} />
}
