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

// 새로운 래핑된 logEvent 함수로 대체
export const logEventWrapper = (eventName: string, eventParams?: Record<string, any>) => {
  const isProd = process.env.NODE_ENV === "production"
  const isAnalyticsEnabled = process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED === "true"

  if (!isProd || !isAnalyticsEnabled) {
    console.log(`[DEV] Firebase Analytics Event: ${eventName}`, eventParams)
    return
  }

  if (typeof window !== "undefined" && analytics) {
    logEvent(analytics, eventName, eventParams)
  }else{
    console.log(`[DEV] Log Event something wrong ${eventName}`, eventParams)
    console.log(`[DEV] isProd ${isProd} / isAnalyticsEnabled`, isAnalyticsEnabled)
  }
}
