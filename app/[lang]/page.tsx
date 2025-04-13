"use client"

import { useEffect, useState ,use} from "react"
import { useSearchParams, usePathname } from "next/navigation"
import DeckBuilder from "../../components/deckBuilder"
import { LoadingScreen } from "../../components/loading-screen"
import { useDataLoader } from "../../hooks/use-data-loader"
import { LanguageProvider } from "../../contexts/language-context"

// Firebase Analytics 관련 import 수정
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
    // logEvent 호출 부분 수정 (analytics 전달 제거)
    if (codeParam) {
      setDeckCode(codeParam)

      if (typeof window !== "undefined") {
        logEventWrapper("deck_shared_visit", {
          deck_code: codeParam,
          language: lang,
        })
      }
    }

    setIsLoading(false)

    // 다른 logEvent 호출 부분도 수정
    if (typeof window !== "undefined") {
      logEventWrapper("page_view", {
        page_path: pathname,
        language: lang,
      })
    }
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
