"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WeddingDetails } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

export function WeddingForm() {
  const { toast } = useToast()
  const { user, demoMode, weddingData, updateWeddingData } = useAuth()
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails>({
    groomName: "",
    brideName: "",
    date: "",
    venue: "",
    estimatedGuests: 0,
  })

  // הוספת ולידציה לטופס פרטי החתונה

  // הוסף את המשתנים הבאים בתוך הקומפוננטה, אחרי הגדרת המשתנים הקיימים
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (weddingData?.weddingDetails) {
      setWeddingDetails(weddingData.weddingDetails)
    }
  }, [weddingData])

  // הוסף פונקציית ולידציה
  const validateForm = (): Record<string, string> => {
    const formErrors: Record<string, string> = {}

    if (!weddingDetails.groomName || weddingDetails.groomName.trim() === "") {
      formErrors.groomName = "שם החתן הוא שדה חובה"
    }

    if (!weddingDetails.brideName || weddingDetails.brideName.trim() === "") {
      formErrors.brideName = "שם הכלה הוא שדה חובה"
    }

    if (!weddingDetails.date) {
      formErrors.date = "תאריך החתונה הוא שדה חובה"
    }

    if (!weddingDetails.venue || weddingDetails.venue.trim() === "") {
      formErrors.venue = "מקום האירוע הוא שדה חובה"
    }

    if (!weddingDetails.estimatedGuests || weddingDetails.estimatedGuests <= 0) {
      formErrors.estimatedGuests = "מספר אורחים משוער הוא שדה חובה ויש להזין מספר חיובי"
    }

    return formErrors
  }

  // עדכון פונקציית handleInputChange
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setWeddingDetails((prev) => ({ ...prev, [name]: value }))

    // סמן את השדה כ"נגעו בו"
    setTouched((prev) => ({ ...prev, [name]: true }))

    // בדוק ולידציה לשדה זה
    const fieldError = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: fieldError }))
  }

  // הוסף פונקציית ולידציה לשדה בודד
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case "groomName":
        return !value || value.trim() === "" ? "שם החתן הוא שדה חובה" : ""
      case "brideName":
        return !value || value.trim() === "" ? "שם הכלה הוא שדה חובה" : ""
      case "estimatedGuests":
        if (!value) return "מספר אורחים משוער הוא שדה חובה"
        if (Number(value) <= 0) return "יש להזין מספר חיובי"
        return ""
      default:
        return ""
    }
  }

  // עדכון פונקציות handleSelectChange ו-handleDateChange
  const handleSelectChange = (name: string, value: string) => {
    setWeddingDetails((prev) => ({ ...prev, [name]: value }))

    // סמן את השדה כ"נגעו בו"
    setTouched((prev) => ({ ...prev, [name]: true }))

    // בדוק ולידציה לשדה זה
    const fieldError = name === "venue" && (!value || value.trim() === "") ? "מקום האירוע הוא שדה חובה" : ""
    setErrors((prev) => ({ ...prev, [name]: fieldError }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setWeddingDetails((prev) => ({ ...prev, date: date.toISOString() }))

      // סמן את השדה כ"נגעו בו"
      setTouched((prev) => ({ ...prev, date: true }))

      // נקה שגיאה אם קיימת
      setErrors((prev) => ({ ...prev, date: "" }))
    } else {
      setTouched((prev) => ({ ...prev, date: true }))
      setErrors((prev) => ({ ...prev, date: "תאריך החתונה הוא שדה חובה" }))
    }
  }

  // עדכון פונקציית handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // בדוק ולידציה לכל הטופס
    const formErrors = validateForm()

    // אם יש שגיאות, הצג אותן ואל תשלח את הטופס
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      // סמן את כל השדות כ"נגעו בהם" כדי להציג את כל השגיאות
      const allTouched: Record<string, boolean> = {}
      Object.keys(formErrors).forEach((field) => {
        allTouched[field] = true
      })
      setTouched({ ...touched, ...allTouched })
      return
    }

    // המשך עם השליחה הרגילה
    if (demoMode) {
      toast({
        title: "פרטי החתונה נשמרו",
        description: "הפרטים עודכנו בהצלחה (מצב הדגמה)",
        variant: "default",
      })
      return
    }

    if (!user) {
      toast({
        title: "שגיאה בשמירת הנתונים",
        description: "אנא התחבר כדי לשמור את הנתונים",
        variant: "destructive",
      })
      return
    }

    try {
      // עדכון מסד הנתונים
      await updateWeddingData({ weddingDetails })

      toast({
        title: "פרטי החתונה נשמרו",
        description: "הפרטים עודכנו בהצלחה",
        variant: "default",
      })
    } catch (error) {
      console.error("שגיאה בשמירת פרטי החתונה:", error)
      toast({
        title: "שגיאה בשמירת הנתונים",
        description: "אירעה שגיאה בעת שמירת הנתונים. אנא נסה שוב.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטי החתונה</CardTitle>
        <CardDescription>הזן את הפרטים הבסיסיים של החתונה שלך</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="groomName">שם החתן</Label>
              <Input
                id="groomName"
                name="groomName"
                placeholder="שם החתן"
                value={weddingDetails.groomName}
                onChange={handleInputChange}
                className={`${errors.groomName && touched.groomName ? "border-red-500" : ""}`}
              />
              {errors.groomName && touched.groomName && <p className="text-red-500 text-sm mt-1">{errors.groomName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brideName">שם הכלה</Label>
              <Input
                id="brideName"
                name="brideName"
                placeholder="שם הכלה"
                value={weddingDetails.brideName}
                onChange={handleInputChange}
                className={`${errors.brideName && touched.brideName ? "border-red-500" : ""}`}
              />
              {errors.brideName && touched.brideName && <p className="text-red-500 text-sm mt-1">{errors.brideName}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>תאריך החתונה</Label>
            <Calendar
              mode="single"
              selected={weddingDetails.date ? new Date(weddingDetails.date) : undefined}
              onSelect={handleDateChange}
              className={`rounded-md border ${errors.date && touched.date ? "border-red-500" : ""}`}
              onFocus={() => setTouched({ ...touched, date: true })}
            />
            {errors.date && touched.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">מקום האירוע</Label>
            <Select
              value={weddingDetails.venue}
              onValueChange={(value) => handleSelectChange("venue", value)}
              onOpenChange={() => setTouched({ ...touched, venue: true })}
            >
              <SelectTrigger className={`${errors.venue && touched.venue ? "border-red-500" : ""}`}>
                <SelectValue placeholder="בחר מקום" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="אולם אירועים">אולם אירועים</SelectItem>
                <SelectItem value="גן אירועים">גן אירועים</SelectItem>
                <SelectItem value="חוף הים">חוף הים</SelectItem>
                <SelectItem value="מקום אחר">מקום אחר</SelectItem>
              </SelectContent>
            </Select>
            {errors.venue && touched.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedGuests">מספר אורחים משוער</Label>
            <Input
              id="estimatedGuests"
              name="estimatedGuests"
              type="number"
              placeholder="הכנס מספר אורחים משוער"
              value={weddingDetails.estimatedGuests}
              onChange={handleInputChange}
              className={`text-left ${errors.estimatedGuests && touched.estimatedGuests ? "border-red-500" : ""}`}
            />
            {errors.estimatedGuests && touched.estimatedGuests && (
              <p className="text-red-500 text-sm mt-1">{errors.estimatedGuests}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            שמור פרטים
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

