"use client"

import { useEffect, useState , use } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import DeckBuilder from "../../components/deckBuilder"
import { LoadingScreen } from "../../components/loading-screen"
import { useDataLoader } from "../../hooks/use-data-loader"
import { LanguageProvider } from "../../contexts/language-context"

// Firebase Analytics 관련 import
import { logEventWrapper } from "../../lib/firebase-config"

interface PageProps {
  params: {
    lang: string
  }
}

export default function Page({ params }: PageProps) {
  const { lang } = use(params)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [deckCode, setDeckCode] = useState<string | null>(null)
  const { data, loading, error } = useDataLoader()

  useEffect(() => {
    // URL에서 code 파라미터 추출
    const codeParam = searchParams.get("code")
    if (codeParam) {
      setDeckCode(codeParam)

      logEventWrapper("deck_shared_visit", {
        deck_code: codeParam,
        language: lang,
      })
    }

    setIsLoading(false)

    // Firebase Analytics 이벤트 전송
    logEventWrapper("page_view", {
      page_path: pathname,
      language: lang,
    })
  }, [searchParams, pathname, lang])

  if (loading || isLoading) {
    return <LoadingScreen message="Loading..." />
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error.message}
        <br />
        Please check console for more details.
      </div>
    )
  }

  return (
    <LanguageProvider initialLanguage={lang} data={data}>
      <DeckBuilder urlDeckCode={deckCode} />
    </LanguageProvider>
  )
}

