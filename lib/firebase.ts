import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Create a safe Firebase initialization function
const initializeFirebase = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
      console.warn("Firebase initialization skipped in server-side rendering during development")
      return {
        app: null,
        auth: {} as any,
        db: {} as any,
      }
    }

    // Use environment variables or fallback to hardcoded values
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyApTQtlJhZpnioYFNxH8QxErIInHGJ3YrY",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "wedplan-47305.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "wedplan-47305",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "wedplan-47305.firebasestorage.app",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "347009449801",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:347009449801:web:2302bbf5292289e787e498",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PTYFZ3EQGN",
    }

    // Initialize Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    const auth = getAuth(app)
    const db = getFirestore(app)

    return { app, auth, db }
  } catch (error) {
    console.error("Firebase initialization error:", error)
    // Return mock objects that won't break the app
    return {
      app: null,
      auth: {} as any,
      db: {} as any,
    }
  }
}

// Initialize Firebase
const { auth, db } = initializeFirebase()

export { auth, db }

