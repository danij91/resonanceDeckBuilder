"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Database } from "../types"

interface LanguageContextType {
  currentLanguage: string
  isChangingLanguage: boolean
  supportedLanguages: string[]
  getTranslatedString: (key: string) => string
  changeLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({
  children,
  initialLanguage,
  data,
}: {
  children: React.ReactNode
  initialLanguage: string
  data: Database | null
}) {
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage)
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  const router = useRouter()

  // supportedLanguages 배열에 'tw' 추가
  const supportedLanguages = ["ko", "en", "jp", "cn", "tw"]

  // 언어 데이터 동적 로딩
  useEffect(() => {
    async function loadLanguageData() {
      if (!data) return

      // 이미 해당 언어 데이터가 있으면 로드하지 않음
      if (data.languages[currentLanguage]) return

      try {
        // 언어 파일 경로 수정 - 실제 API 경로에 맞게 조정
        const langResponse = await fetch(`/api/db/lang_${currentLanguage}.json`)
        if (!langResponse.ok) {
          throw new Error(`Failed to load language data: ${langResponse.status}`)
        }

        const langData = await langResponse.json()

        // 데이터 구조 확인 후 언어 데이터 추가
        if (data && data.languages) {
          data.languages[currentLanguage] = langData

          // 상태 업데이트를 위해 강제 리렌더링 트리거 (선택적)
          setIsChangingLanguage(true)
          setTimeout(() => setIsChangingLanguage(false), 10)
        }
      } catch (error) {
        console.error("Failed to load language data:", error)
      }
    }

    loadLanguageData()
  }, [currentLanguage, data])

  // 번역 함수
  const getTranslatedString = useCallback(
    (key: string) => {
      if (!data || !data.languages[currentLanguage]) return key
      return data.languages[currentLanguage][key] || key
    },
    [data, currentLanguage],
  )

  // 언어 변경 함수
  const changeLanguage = useCallback(
    (newLanguage: string) => {
      if (currentLanguage === newLanguage) return

      setIsChangingLanguage(true)

      // URL 변경
      router.push(`/${newLanguage}`)

      // 상태 업데이트
      setCurrentLanguage(newLanguage)

      // 로딩 상태 해제 (약간의 지연 추가)
      setTimeout(() => {
        setIsChangingLanguage(false)
      }, 300)
    },
    [currentLanguage, router],
  )

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        isChangingLanguage,
        supportedLanguages,
        getTranslatedString,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

// 커스텀 훅
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
