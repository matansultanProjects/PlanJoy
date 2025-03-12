"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { signInAnonymously } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { useCustomToast } from "@/components/ui/custom-toast"
import { Overview } from "@/components/overview"
import { GuestList } from "@/components/guest-list"
import { Budget } from "@/components/budget"
import { Timeline } from "@/components/timeline"
import { SeatingArrangement } from "@/components/seating-arrangement"
import { VendorManager } from "@/components/vendor-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loading-spinner"

export function SharedWeddingView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shareId = searchParams.get("id")
  const { checkSharedAccess, weddingData, sharedWeddingId, isSharedView } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const customToast = useCustomToast()

  useEffect(() => {
    async function fetchSharedWedding() {
      if (!shareId) {
        setError("לא סופק מזהה שיתוף")
        setLoading(false)
        return
      }

      try {
        console.log("בודק גישה לחתונה משותפת עם מזהה:", shareId)

        // Sign in anonymously if needed
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth)
            console.log("התחברות אנונימית הצליחה")
          } catch (signInError) {
            console.error("שגיאה בהתחברות אנונימית:", signInError)
          }
        }

        // בדיקה אם מסמך השיתוף קיים
        const shareDoc = await getDoc(doc(db, "weddingShares", shareId))
        console.log("מסמך שיתוף קיים:", shareDoc.exists())

        if (!shareDoc.exists()) {
          setError("קישור שיתוף לא תקין")
          customToast.error("שגיאה", "קישור השיתוף אינו תקין")
          setLoading(false)
          return
        }

        const weddingId = shareDoc.data().weddingId
        console.log("מזהה חתונה מהשיתוף:", weddingId)

        // שימוש בפונקציית checkSharedAccess מ-AuthProvider
        const result = await checkSharedAccess(shareId)

        if (!result) {
          setError("לא ניתן לגשת לחתונה המשותפת")
          customToast.error("שגיאה", "לא ניתן לגשת לחתונה המשותפת")
          setLoading(false)
        } else {
          // הוספת עיכוב קצר כדי לאפשר ל-listeners להתחבר ולטעון נתונים
          setTimeout(() => {
            setLoading(false)
            customToast.info("צפייה בחתונה משותפת", "אתה צופה בחתונה ששותפה איתך")
          }, 1000)
        }
      } catch (error) {
        console.error("שגיאה בטעינת חתונה משותפת:", error)
        setError("שגיאה בטעינת החתונה המשותפת")
        customToast.error("שגיאה", "אירעה שגיאה בטעינת החתונה המשותפת")
        setLoading(false)
      }
    }

    fetchSharedWedding()
  }, [shareId, checkSharedAccess, customToast])

  const handleRefreshData = () => {
    if (shareId) {
      setLoading(true)
      checkSharedAccess(shareId)
        .then(() => {
          customToast.success("הנתונים עודכנו", "הנתונים עודכנו בהצלחה")
          setLoading(false)
        })
        .catch((error) => {
          console.error("שגיאה בעדכון נתונים:", error)
          customToast.error("שגיאה בעדכון נתונים", "אירעה שגיאה בעת עדכון הנתונים")
          setLoading(false)
        })
    }
  }

  // אם יש לנו נתוני חתונה, הצג את התצוגה המשותפת
  if (weddingData && !loading && isSharedView) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>צפייה בחתונה משותפת</CardTitle>
              <CardDescription>
                אתה צופה בחתונה של {weddingData.weddingDetails?.brideName} ו{weddingData.weddingDetails?.groomName}
              </CardDescription>
            </div>
            <Button onClick={handleRefreshData} variant="outline" className="flex items-center gap-2">
              <LoadingSpinner size="small" className="mr-2" />
              רענן נתונים
            </Button>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
            <TabsTrigger value="guests">רשימת אורחים</TabsTrigger>
            <TabsTrigger value="budget">תקציב</TabsTrigger>
            <TabsTrigger value="timeline">ציר זמן</TabsTrigger>
            <TabsTrigger value="seating">סידורי הושבה</TabsTrigger>
            <TabsTrigger value="vendors">ספקים</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Overview isSharedView={true} />
          </TabsContent>
          <TabsContent value="guests">
            <GuestList isSharedView={true} />
          </TabsContent>
          <TabsContent value="budget">
            <Budget isSharedView={true} />
          </TabsContent>
          <TabsContent value="timeline">
            <Timeline isSharedView={true} />
          </TabsContent>
          <TabsContent value="seating">
            <SeatingArrangement isSharedView={true} />
          </TabsContent>
          <TabsContent value="vendors">
            <VendorManager isSharedView={true} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // הצג מצב טעינה או שגיאה
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {loading ? "טוען חתונה משותפת..." : "שגיאה בטעינת החתונה המשותפת"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {loading ? (
            <LoadingSpinner size="large" />
          ) : (
            <>
              <p className="text-center text-muted-foreground">{error}</p>
              <Button onClick={() => router.push("/login")}>חזרה לדף הכניסה</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

