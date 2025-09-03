"use client"

import React, { useState } from "react"
import { X, ExternalLink, Info, ArrowLeft } from "lucide-react"
import { dismissPromoModalForDay } from "../utils/first-visit"

interface PromotionalModalProps {
  isOpen: boolean
  onClose: () => void
  getTranslatedString: (key: string) => string
  customIconUrl?: string
  hideDissmissButton?: boolean // 추가: "오늘 하루 보지 않기" 버튼 숨김 여부
}

// 홍보 모달용 언어 데이터
const promoLanguageData = {
  ko: {
    title: "안녕하세요! 👋",
    subtitle: "그동안 레조넌스 덱 빌더를 이용해주셔서 감사합니다",
    description: "이번에 개인적으로 새로운 iOS 앱을 개발했어요! TestFlight을 통해 베타 테스트에 참여하고 피드백을 남겨주세요!",
    cta: "TestFlight에서 확인하기",
    dismiss: "오늘 하루 보지 않기",
    thanks: "이 사이트가 도움이 되셨다면, 제가 만든 앱도 한번 봐주세요! 😊",
    appIntroButton: "앱 소개",
    backButton: "돌아가기",
    appIntroTitle: "Tap&Talk 소개",
    appIntroDescription: "Tap&Talk은 스마트폰 키보드를 사용하기 어려운 상황이나 잠들기 전, 음성만으로 간편하게 메모할 수 있는 앱입니다. 말한 내용은 자동으로 텍스트로 변환되어 메모 목록에 저장됩니다.\n\n특히 저는 자기 전에 내일 할 일이나 아이디어가 떠올라도 스마트폰을 집어 들기 귀찮아서 이 앱을 만들었습니다. 그래서 애플 워치와도 연동해 더 편리하게 사용할 수 있습니다."
  },
  en: {
    title: "Hello! 👋",
    subtitle: "Thank you for using Resonance Deck Builder",
    description: "I've personally developed a new iOS app! Join the beta test through TestFlight and leave your feedback!",
    cta: "Check it out on TestFlight",
    dismiss: "Don't show today",
    thanks: "If this site has been helpful, please check out my app too! 😊",
    appIntroButton: "App Intro",
    backButton: "Back",
    appIntroTitle: "About Tap&Talk",
    appIntroDescription: "Tap&Talk is an app that allows you to easily take voice memos when it's difficult to use the smartphone keyboard or before going to sleep. Your spoken words are automatically converted to text and saved in your memo list.\n\nI created this app because I was too lazy to pick up my smartphone when ideas or tomorrow's to-dos came to mind before bed. So it also works with Apple Watch for even more convenience."
  },
  jp: {
    title: "こんにちは！ 👋",
    subtitle: "レゾナンスデッキエディターをご利用いただきありがとうございます",
    description: "今回、個人的に新しいiOSアプリを開発しました！TestFlightでベータテストに参加して、フィードバックをお願いします！",
    cta: "TestFlightで確認する",
    dismiss: "今日は表示しない",
    thanks: "このサイトが役に立ったなら、私のアプリもチェックしてみてください！ 😊",
    appIntroButton: "アプリ紹介",
    backButton: "戻る",
    appIntroTitle: "Tap&Talk について",
    appIntroDescription: "Tap&Talkは、スマートフォンのキーボードが使いにくい状況や就寝前に、音声だけで簡単にメモできるアプリです。話した内容は自動的にテキストに変換されてメモリストに保存されます。\n\n特に私は、寝る前に明日のやることやアイデアが浮かんでも、スマートフォンを手に取るのが面倒で、このアプリを作りました。そのためApple Watchとも連動して、さらに便利に使用できます。"
  },
  cn: {
    title: "你好！ 👋",
    subtitle: "感谢您使用 Resonance 牌组构建器",
    description: "这次我个人开发了一个新的 iOS 应用！通过 TestFlight 参与测试版测试并留下反馈吧！",
    cta: "在 TestFlight 上查看",
    dismiss: "今天不再显示",
    thanks: "如果这个网站对您有帮助，也请看看我的应用吧！ 😊",
    appIntroButton: "应用介绍",
    backButton: "返回",
    appIntroTitle: "关于 Tap&Talk",
    appIntroDescription: "Tap&Talk 是一个可以在难以使用智能手机键盘的情况下或睡前，仅通过语音轻松记录备忘录的应用。说话内容会自动转换为文本并保存在备忘录列表中。\n\n特别是我在睡前想到明天要做的事或想法时，懒得拿起智能手机，所以制作了这个应用。因此它也可以与Apple Watch联动，使用更加方便。"
  },
  tw: {
    title: "你好！ 👋", 
    subtitle: "感謝您使用 Resonance 牌組構建器",
    description: "這次我個人開發了一個新的 iOS 應用程式！透過 TestFlight 參與測試版測試並留下回饋吧！",
    cta: "在 TestFlight 上查看",
    dismiss: "今天不再顯示",
    thanks: "如果這個網站對您有幫助，也請看看我的應用程式吧！ 😊",
    appIntroButton: "應用程式介紹",
    backButton: "返回",
    appIntroTitle: "關於 Tap&Talk",
    appIntroDescription: "Tap&Talk 是一個可以在難以使用智慧型手機鍵盤的情況下或睡前，僅透過語音輕鬆記錄備忘錄的應用程式。說話內容會自動轉換為文字並儲存在備忘錄清單中。\n\n特別是我在睡前想到明天要做的事或想法時，懶得拿起智慧型手機，所以製作了這個應用程式。因此它也可以與Apple Watch連動，使用更加方便。"
  }
}

export function PromotionalModal({ isOpen, onClose, getTranslatedString, customIconUrl, hideDissmissButton = false }: PromotionalModalProps) {
  const [showAppIntro, setShowAppIntro] = useState(false)
  
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (!hideDissmissButton) {
        dismissPromoModalForDay()
      }
      onClose()
    }
  }

  const handleCloseClick = () => {
    if (!hideDissmissButton) {
      dismissPromoModalForDay()
    }
    onClose()
  }

  const handleAppLinkClick = () => {
    // TestFlight 링크로 이동
    window.open("https://testflight.apple.com/join/3mjy6MJF", "_blank", "noopener,noreferrer")
    
    // 링크 클릭 시에는 24시간 타이머 설정하지 않음 (다시 홍보할 기회를 줌)
    onClose()
  }

  // 현재 언어 감지 (기본값: 영어)
  const getCurrentLanguage = () => {
    // getTranslatedString으로 현재 언어 감지 시도
    const testKey = getTranslatedString("app.title.main")
    if (testKey?.includes("레조넌스")) return "ko"
    if (testKey?.includes("共鳴")) return "cn" 
    if (testKey?.includes("共鳴") && testKey?.includes("繁")) return "tw"
    if (testKey?.includes("レゾナンス")) return "jp"
    return "en"
  }

  const currentLang = getCurrentLanguage()
  const texts = promoLanguageData[currentLang as keyof typeof promoLanguageData] || promoLanguageData.en

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-8 m-4 max-w-md w-full shadow-2xl transform transition-all duration-300 ease-out">
        {/* Close Button */}
        <button
          onClick={handleCloseClick}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Content with Slide Animation */}
        <div className="text-center overflow-hidden">
          <div className={`flex transition-transform duration-500 ease-in-out ${showAppIntro ? '-translate-x-full' : 'translate-x-0'}`}>
            {/* Main Content */}
            <div className="w-full flex-shrink-0">
              {/* App Icon - 커스텀 이미지 또는 기본 아이콘 */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
                {customIconUrl ? (
                  <img 
                    src={customIconUrl} 
                    alt="App Icon" 
                    className="w-full h-full object-cover rounded-2xl"
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 아이콘으로 대체
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallbackIcon = target.parentElement?.querySelector('.fallback-icon') as HTMLElement
                      if (fallbackIcon) fallbackIcon.style.display = 'block'
                    }}
                  />
                ) : null}
                <span className={`text-3xl ${customIconUrl ? 'fallback-icon hidden' : ''}`}>✈️</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {texts.title}
              </h2>

              {/* Subtitle */}
              <h3 className="text-lg text-blue-300 mb-4 font-medium">
                {texts.subtitle}
              </h3>

              {/* Thanks message */}
              <p className="text-green-300 text-sm mb-4 italic">
                {texts.thanks}
              </p>

              {/* Description */}
              <p className="text-gray-300 mb-6 leading-relaxed">
                {texts.description}
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3 mb-4">
                {/* CTA Button */}
                <button
                  onClick={handleAppLinkClick}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  {texts.cta}
                </button>

                {/* App Intro Button */}
                <button
                  onClick={() => setShowAppIntro(true)}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  <Info className="w-4 h-4" />
                  {texts.appIntroButton}
                </button>
              </div>

              {/* Dismiss Text - 조건부 표시 */}
              {!hideDissmissButton && (
                <p className="text-gray-500 text-xs">
                  {texts.dismiss}
                </p>
              )}
            </div>

            {/* App Intro Content */}
            <div className="w-full flex-shrink-0 px-4">
              {/* Back Button */}
              <button
                onClick={() => setShowAppIntro(false)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {texts.backButton}
              </button>

              {/* App Icon (smaller) */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {customIconUrl ? (
                  <img 
                    src={customIconUrl} 
                    alt="App Icon" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : null}
                <span className={`text-2xl ${customIconUrl ? 'fallback-icon hidden' : ''}`}>✈️</span>
              </div>

              {/* App Intro Title */}
              <h2 className="text-xl font-bold text-white mb-4">
                {texts.appIntroTitle}
              </h2>

              {/* App Intro Description */}
              <p className="text-gray-300 leading-relaxed mb-6">
                {texts.appIntroDescription}
              </p>

              {/* CTA Button in Intro */}
              <button
                onClick={handleAppLinkClick}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                {texts.cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}