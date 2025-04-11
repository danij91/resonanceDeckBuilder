import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, logEvent } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAPp39tLQ5YkU0x2XDeU-ZuCG9pbmvGcUM",
  authDomain: "rsns-deck-builder.firebaseapp.com",
  projectId: "rsns-deck-builder",
  storageBucket: "rsns-deck-builder.firebasestorage.app",
  messagingSenderId: "1016878414192",
  appId: "1:1016878414192:web:06c43b800bd056d02077b5",
  measurementId: "G-37YDR54077"
};

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)

// Initialize Firebase Analytics
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

const isProd = process.env.NODE_ENV === "development"
const isAnalyticsEnabled = process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED === "true"

// 새로운 래핑된 logEvent 함수로 대체
export const logEventWrapper = (eventName: string, eventParams?: Record<string, any>) => {
  if (!isProd || !isAnalyticsEnabled) {
    console.log(isProd)
    console.log(isAnalyticsEnabled)
    console.log(`[DEV] Firebase Analytics Events: ${eventName}/ isProd = ${isProd} ${isAnalyticsEnabled}`, eventParams)
    return
  }

  if (typeof window !== "undefined" && analytics) {
    try {
      logEvent(analytics, eventName, eventParams)
    } catch (error) {
      console.error(`[ERROR] Failed to log event: ${eventName}`, error)
    }
  } else {
    console.warn(`[WARN] Analytics not available. Event: ${eventName}`, eventParams)
    console.log(`[DEBUG] isProd: ${isProd}, isAnalyticsEnabled: ${isAnalyticsEnabled}`)
  }
}
