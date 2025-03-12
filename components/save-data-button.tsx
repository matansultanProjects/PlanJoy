"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCustomToast } from "@/components/ui/custom-toast"
import { useAuth } from "./auth-provider"

export function SaveDataButton() {
  const [isSaving, setIsSaving] = useState(false)
  const customToast = useCustomToast()
  const { demoMode, saveAllData } = useAuth()

  const handleSave = async () => {
    if (demoMode) {
      customToast.warning("אזהרת מצב הדגמה", "לא ניתן לשמור שינויים במצב הדגמה")
      return
    }

    setIsSaving(true)

    try {
      await saveAllData()
      customToast.success("הנתונים נשמרו", "כל הנתונים נשמרו בהצלחה")
    } catch (error: any) {
      console.error("שגיאה בשמירת נתונים:", error)
      customToast.error("שגיאה בשמירת הנתונים", `אירעה שגיאה בעת שמירת הנתונים: ${error.message}. אנא נסה שוב.`)
    } finally {
      setIsSaving(false)
    }
  }

  // אם אנחנו במצב דמו, לא נציג את הכפתור בכלל
  if (demoMode) return null

  return (
    <Button onClick={handleSave} disabled={isSaving} className="mt-4">
      {isSaving ? "שומר..." : "שמור כל הנתונים"}
    </Button>
  )
}

