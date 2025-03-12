"use client"

import type React from "react"
import { createContext, useState, useEffect, useCallback, useContext } from "react"
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
  signInAnonymously as firebaseSignInAnonymously,
} from "firebase/auth"
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase" // עדכון הייבוא
import type { WeddingData } from "@/types"

interface AuthContextType {
  user: User | null
  weddingData: WeddingData | null
  loading: boolean
  signOut: () => Promise<void>
  signInAnonymously: () => Promise<void>
  createWeddingDocument: (uid: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
  sharedId?: string
  sharedWeddingId?: string
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, sharedId, sharedWeddingId }) => {
  const [user, setUser] = useState<User | null>(null)
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null)
  const [loading, setLoading] = useState(true)

  const createWeddingDocument = useCallback(
    async (uid: string) => {
      try {
        const weddingDocRef = doc(db, "weddings", uid)
        // Basic wedding data, can be expanded
        const initialWeddingData: WeddingData = {
          groomName: "",
          brideName: "",
          weddingDate: new Date(),
          // Add other initial values as needed
        }
        await setDoc(weddingDocRef, initialWeddingData)
        console.log("Wedding document created for user:", uid)
      } catch (error) {
        console.error("Error creating wedding document:", error)
      }
    },
    [db],
  )

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setWeddingData(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const signInAnonymously = async () => {
    try {
      await firebaseSignInAnonymously(auth)
    } catch (error) {
      console.error("Error signing in anonymously:", error)
    }
  }

  const setupDataListeners = useCallback(
    async (uid: string) => {
      console.log("Setting up data listeners for user wedding:", uid)

      try {
        // בדיקה אם מדובר במשתמש אנונימי במצב שיתוף
        const isAnonymousUser = auth.currentUser?.isAnonymous || false

        if (isAnonymousUser && sharedWeddingId) {
          // במקרה של משתמש אנונימי בתצוגת שיתוף, נשתמש ב-sharedWeddingId במקום ב-uid
          console.log("Anonymous user viewing shared wedding:", sharedWeddingId)

          // בדיקה שה-share קיים
          const shareDoc = await getDoc(doc(db, "weddingShares", sharedId || ""))
          if (!shareDoc.exists()) {
            console.error("Share document does not exist")
            return
          }

          const shareData = shareDoc.data()
          const targetWeddingId = shareData.weddingId

          // מאזין לנתוני החתונה המשותפת
          const unsubWedding = onSnapshot(
            doc(db, "weddings", targetWeddingId),
            (doc) => {
              console.log("Shared wedding document update:", doc.exists())
              if (doc.exists()) {
                setWeddingData(doc.data() as WeddingData)
                console.log("Shared wedding data:", doc.data())
              } else {
                console.log("Shared wedding document does not exist")
                setWeddingData(null)
              }
            },
            (error) => {
              console.error("Error listening to shared wedding:", error)
              setWeddingData(null)
            },
          )

          return () => {
            unsubWedding()
          }
        }

        // המשך הקוד הקיים לטיפול במשתמש רגיל...
        const unsubWedding = onSnapshot(
          doc(db, "weddings", uid),
          async (doc) => {
            console.log("Wedding document update:", doc.exists())
            if (doc.exists()) {
              setWeddingData(doc.data() as WeddingData)
              console.log("Wedding data:", doc.data())
            } else {
              console.log("Wedding document does not exist")
              // יצירת מסמך חתונה חדש אם לא קיים
              if (!auth.currentUser?.isAnonymous) {
                console.log("Creating wedding for user:", uid)
                await createWeddingDocument(uid)
              } else {
                setWeddingData(null)
              }
            }
          },
          (error) => {
            console.error("Error listening to wedding:", error)
            setWeddingData(null)
          },
        )

        return () => {
          unsubWedding()
        }
      } catch (error) {
        console.error("Error in setupDataListeners:", error)
        return () => {}
      }
    },
    [sharedId, sharedWeddingId, createWeddingDocument],
  )

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        await setupDataListeners(user.uid)
      } else {
        setUser(null)
        setWeddingData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, setupDataListeners])

  const value: AuthContextType = {
    user,
    weddingData,
    loading,
    signOut,
    signInAnonymously,
    createWeddingDocument,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

