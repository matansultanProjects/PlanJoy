"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useCustomToast } from "@/components/ui/custom-toast"
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Copy, Trash2, Share2 } from "lucide-react"

export function WeddingShare() {
  const { user, demoMode } = useAuth()
  const [shares, setShares] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingShares, setLoadingShares] = useState(false)
  const customToast = useCustomToast()

  // Load existing shares
  const loadShares = async () => {
    if (demoMode || !user) return

    setLoadingShares(true)
    try {
      const sharesQuery = query(collection(db, "weddingShares"), where("createdBy", "==", user.uid))
      const snapshot = await getDocs(sharesQuery)
      const sharesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setShares(sharesList)
      customToast.success("שיתופים נטענו", "רשימת השיתופים נטענה בהצלחה")
    } catch (error) {
      console.error("Error loading shares:", error)
      customToast.error("שגיאה בטעינת שיתופים", "אירעה שגיאה בטעינת השיתופים הקיימים")
    } finally {
      setLoadingShares(false)
    }
  }

  // Create a new share
  const createShare = async () => {
    if (demoMode) {
      customToast.warning("מצב הדגמה", "לא ניתן ליצור שיתופים במצב הדגמה")
      return
    }

    if (!user) {
      customToast.error("לא מחובר", "אנא התחבר כדי ליצור שיתוף")
      return
    }

    setLoading(true)
    try {
      // Create a unique ID for the share with timestamp
      const shareData = {
        weddingId: user.uid,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        name: `שיתוף ${new Date().toLocaleDateString("he-IL")}`,
      }

      const docRef = await addDoc(collection(db, "weddingShares"), shareData)

      // Add the new share to the list
      setShares([...shares, { id: docRef.id, ...shareData }])

      customToast.success("שיתוף נוצר", "השיתוף נוצר בהצלחה")
    } catch (error) {
      console.error("Error creating share:", error)
      customToast.error("שגיאה ביצירת שיתוף", "אירעה שגיאה בעת יצירת השיתוף")
    } finally {
      setLoading(false)
    }
  }

  // Delete a share
  const deleteShare = async (shareId: string) => {
    if (demoMode) {
      customToast.warning("מצב הדגמה", "לא ניתן למחוק שיתופים במצב הדגמה")
      return
    }

    try {
      await deleteDoc(doc(db, "weddingShares", shareId))
      setShares(shares.filter((share) => share.id !== shareId))
      customToast.success("שיתוף נמחק", "השיתוף נמחק בהצלחה")
    } catch (error) {
      console.error("Error deleting share:", error)
      customToast.error("שגיאה במחיקת שיתוף", "אירעה שגיאה בעת מחיקת השיתוף")
    }
  }

  // Copy share link to clipboard
  const copyShareLink = (shareId: string) => {
    const shareLink = `${window.location.origin}/shared/${shareId}`
    navigator.clipboard.writeText(shareLink)
    customToast.success("הקישור הועתק", "קישור השיתוף הועתק ללוח")
  }

  // טעינת שיתופים בעת טעינת הקומפוננטה
  useEffect(() => {
    if (!demoMode && user) {
      loadShares()
    }
  }, [demoMode, user])

  return (
    <Card>
      <CardHeader>
        <CardTitle>שיתוף החתונה</CardTitle>
        <CardDescription>צור קישור לשיתוף החתונה עם אחרים</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button onClick={createShare} disabled={loading || demoMode} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            צור קישור שיתוף חדש
          </Button>

          <Button variant="outline" onClick={loadShares} disabled={loadingShares || demoMode}>
            רענן שיתופים
          </Button>
        </div>

        {shares.length > 0 ? (
          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-medium">קישורי שיתוף קיימים</h3>
            <div className="space-y-2">
              {shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{share.name}</p>
                    <p className="text-sm text-muted-foreground">
                      נוצר ב-{new Date(share.createdAt).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyShareLink(share.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteShare(share.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            {demoMode ? "שיתוף אינו זמין במצב הדגמה" : "אין קישורי שיתוף קיימים. צור קישור חדש כדי לשתף את החתונה."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

