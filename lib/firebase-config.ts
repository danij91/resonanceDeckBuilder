// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPp39tLQ5YkU0x2XDeU-ZuCG9pbmvGcUM",
  authDomain: "rsns-deck-builder.firebaseapp.com",
  projectId: "rsns-deck-builder",
  storageBucket: "rsns-deck-builder.firebasestorage.app",
  messagingSenderId: "1016878414192",
  appId: "1:1016878414192:web:06c43b800bd056d02077b5",
  measurementId: "G-37YDR54077"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics: ReturnType<typeof getAnalytics> | null = null

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app)
  }
})
const db = getFirestore(app)

export { analytics, logEvent, db }