"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { signInAnonymously } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface SharedViewProps {
  id: string
}

export default function SharedView({ id }: SharedViewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const router = useRouter()
  const { checkSharedAccess } = useAuth()

  // פונקציה לטעינת החתונה המשותפת
  const loadSharedWedding = async () => {
    try {
      setLoading(true)
      addDebugInfo("מתחיל תהליך טעינת חתונה משותפת")

      // התחברות אנונימית אם צריך
      if (!auth.currentUser) {
        try {
          addDebugInfo("מנסה להתחבר אנונימית")
          await signInAnonymously(auth)
          addDebugInfo("התחברות אנונימית הצליחה")
        } catch (signInError) {
          addDebugInfo(`שגיאה בהתחברות אנונימית: ${signInError}`)
          setError("שגיאה בהתחברות אנונימית")
          setLoading(false)
          return
        }
      } else {
        addDebugInfo(`משתמש כבר מחובר: ${auth.currentUser.uid}`)
      }

      // בדיקת מסמך השיתוף
      try {
        addDebugInfo(`בודק מסמך שיתוף עם ID: ${id}`)
        const shareDoc = await getDoc(doc(db, "weddingShares", id))

        if (!shareDoc.exists()) {
          addDebugInfo("מסמך השיתוף לא קיים")
          setError("קישור השיתוף אינו תקין או שפג תוקפו")
          setLoading(false)
          return
        }

        const shareData = shareDoc.data()
        const weddingId = shareData.weddingId
        addDebugInfo(`מסמך שיתוף נמצא, מזהה חתונה: ${weddingId}`)

        // שמירת מידע השיתוף ב-localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("viewingSharedWedding", "true")
          localStorage.setItem("sharedWeddingId", id)
          localStorage.setItem("targetWeddingId", weddingId)
          addDebugInfo("מידע השיתוף נשמר ב-localStorage")
        }

        // בדיקת גישה למסמך החתונה
        try {
          addDebugInfo(`מנסה לגשת למסמך החתונה: ${weddingId}`)
          const weddingDoc = await getDoc(doc(db, "weddings", weddingId))

          if (weddingDoc.exists()) {
            addDebugInfo("מסמך החתונה נמצא בהצלחה")

            // שימוש בפונקציית checkSharedAccess מ-AuthContext
            const accessGranted = await checkSharedAccess(id)

            if (accessGranted) {
              addDebugInfo("הגישה אושרה, מעביר לדף הבית")
              // Use setTimeout to ensure this runs after hydration
              setTimeout(() => {
                router.push("/dashboard")
              }, 0)
            } else {
              addDebugInfo("הגישה נדחתה על ידי checkSharedAccess")
              setError("אין הרשאות לצפייה בחתונה זו")
              setLoading(false)
            }
          } else {
            addDebugInfo("מסמך החתונה לא קיים")
            setError("החתונה המבוקשת לא נמצאה")
            setLoading(false)
          }
        } catch (docError: any) {
          addDebugInfo(`שגיאה בגישה למסמך החתונה: ${docError.message}`)
          console.error("Error accessing wedding document:", docError)

          // ניסיון נוסף עם השהייה
          if (retryCount < 3) {
            addDebugInfo(`מתוכנן ניסיון נוסף (${retryCount + 1}/3) בעוד ${(retryCount + 1) * 1000}ms`)
            setTimeout(
              () => {
                setRetryCount((prev) => prev + 1)
              },
              1000 * (retryCount + 1),
            )
          } else {
            setError("אין הרשאות לצפייה בחתונה זו")
            setLoading(false)
          }
        }
      } catch (shareError: any) {
        addDebugInfo(`שגיאה בבדיקת מסמך השיתוף: ${shareError.message}`)
        console.error("Error checking share document:", shareError)
        setError("שגיאה בטעינת פרטי השיתוף")
        setLoading(false)
      }
    } catch (err: any) {
      addDebugInfo(`שגיאה כללית: ${err.message}`)
      console.error("Error in loadSharedWedding:", err)

      if (retryCount < 3) {
        addDebugInfo(`מתוכנן ניסיון נוסף (${retryCount + 1}/3) בעוד ${(retryCount + 1) * 1000}ms`)
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1)
          },
          1000 * (retryCount + 1),
        )
      } else {
        setError("אירעה שגיאה בטעינת החתונה המשותפת")
        setLoading(false)
      }
    }
  }

  // פונקציה להוספת מידע דיבאג
  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
    console.log(`DEBUG: ${info}`)
  }

  // טעינת החתונה המשותפת בעת טעינת הקומפוננטה
  useEffect(() => {
    loadSharedWedding()
  }, [retryCount])

  // תצוגת טעינה
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="large" />
          <p className="text-lg font-medium">טוען חתונה משותפת...</p>
          {retryCount > 0 && <p className="text-sm text-muted-foreground">מנסה שוב... ({retryCount}/3)</p>}
        </div>
      </div>
    )
  }

  // תצוגת שגיאה
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">שגיאה</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-6">{error}</p>
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push("/")} variant="outline">
                  חזרה לדף הבית
                </Button>
                {retryCount < 3 && <Button onClick={() => setRetryCount((prev) => prev + 1)}>נסה שוב</Button>}
              </div>

              {/* מידע דיבאג - מוצג רק בסביבת פיתוח */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-6 p-3 bg-gray-100 rounded-md text-xs overflow-auto max-h-60">
                  <p className="font-bold mb-2">מידע דיבאג:</p>
                  <ul className="space-y-1">
                    {debugInfo.map((info, index) => (
                      <li key={index}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

