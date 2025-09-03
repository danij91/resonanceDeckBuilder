// 홍보 모달 표시 관리를 위한 유틸리티

const PROMO_MODAL_KEY = "resonance_deck_builder_promo_modal"

export function shouldShowPromoModal(): boolean {
  if (typeof window === "undefined") return false
  
  try {
    const lastDismissed = localStorage.getItem(PROMO_MODAL_KEY)
    if (!lastDismissed) return true
    
    const lastDismissedTime = parseInt(lastDismissed, 10)
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    // 24시간이 지났으면 다시 표시
    return (now - lastDismissedTime) > twentyFourHours
  } catch (error) {
    console.warn("Could not access localStorage:", error)
    return false
  }
}

export function dismissPromoModalForDay(): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(PROMO_MODAL_KEY, Date.now().toString())
  } catch (error) {
    console.warn("Could not set localStorage:", error)
  }
}

export function resetPromoModal(): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.removeItem(PROMO_MODAL_KEY)
  } catch (error) {
    console.warn("Could not remove from localStorage:", error)
  }
}

// 레거시 함수들 (기존 코드 호환성을 위해 유지)
export function isFirstVisit(): boolean {
  return shouldShowPromoModal()
}

export function markAsVisited(): void {
  dismissPromoModalForDay()
}