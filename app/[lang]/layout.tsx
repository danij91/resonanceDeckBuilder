"use client"

import { use, useEffect } from "react"
import type React from "react"

const metadataByLanguage: Record<string, { title: string; description: string }> = {
  en: {
    title: "Resonance Deck Builder",
    description: "Build and share your Resonance decks with ease",
  },
  ko: {
    title: "레조넌스 덱 빌더",
    description: "레조넌스 덱을 쉽게 만들고 공유하세요",
  },
  jp: {
    title: "レゾナンス デッキエディター",
    description: "レゾナンスのデッキを簡単に作成して共有",
  },
  cn: {
    title: "共鸣卡组构建器",
    description: "轻松创建和分享您的共鸣卡组",
  },
  tw: {
    title: "共鳴牌組構建器",
    description: "輕鬆創建和分享您的共鳴牌組",
  },
}

interface LayoutProps {
  children: React.ReactNode
  params: {
    lang: string
  }
}

export default function LangLayout({ children, params }: LayoutProps) {
  // ✅ 바로 여기! use()로 params 해제
  const { lang } = use(params)
  const meta = metadataByLanguage[lang] ?? metadataByLanguage["en"]

  // ✅ document.title 직접 조작 (원할 경우)
  useEffect(() => {
    document.title = meta.title
  }, [lang])

  return (
    <>
      {children}
    </>
  )
}
