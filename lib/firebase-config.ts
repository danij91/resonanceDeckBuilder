import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, logEvent } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)

// Initialize Firebase Analytics
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

const isProd = process.env.NODE_ENV === "production"
const isAnalyticsEnabled = process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED === "true"

// 새로운 래핑된 logEvent 함수로 대체
export const logEventWrapper = (eventName: string, eventParams?: Record<string, any>) => {
  if (!isProd || !isAnalyticsEnabled) {
    console.log(`[DEV] Firebase Analytics Events: ${eventName}`, eventParams)
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
