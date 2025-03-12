"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useCustomToast } from "@/components/ui/custom-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import {
  CalendarIcon,
  Heart,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  PartyPopper,
  Cake,
  Music,
  Camera,
  GlassWater,
} from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import Image from "next/image"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateWeddingData, loading } = useAuth()
  const customToast = useCustomToast()
  const [weddingDetails, setWeddingDetails] = useState({
    groomName: "",
    brideName: "",
    date: "",
    venue: "",
    estimatedGuests: 100,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 3
  // עדכון הקוד כדי לוודא שהמשתמש ממלא את כל השדות ולא מדלג על שלבים

  // הוסף את המשתנים הבאים בתוך הקומפוננטה, אחרי הגדרת המשתנים הקיימים
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // If user is not logged in and not loading, redirect to login
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Separate function for final submission - only called at the end
  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Save wedding details to Firebase
      await updateWeddingData({
        weddingDetails,
        // Set firstTimeSetup to false to indicate onboarding is complete
        firstTimeSetup: false,
        // Set creation timestamp
        createdAt: new Date().toISOString(),
      })

      customToast.success("פרטי החתונה נשמרו", "החתונה נוצרה בהצלחה!")

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving wedding details:", error)
      customToast.error("שגיאה", "אירעה שגיאה בשמירת פרטי החתונה")
    } finally {
      setIsSubmitting(false)
    }
  }

  // הוסף פונקציה לטיפול בשינוי שדה ועדכון מצב "נגעו בשדה"
  const handleFieldChange = (field: string, value: any) => {
    setWeddingDetails({ ...weddingDetails, [field]: value })
    setTouched({ ...touched, [field]: true })

    // בדוק ולידציה לשדה זה אם כבר נגעו בו
    if (touched[field]) {
      const fieldError = validateField(field, value)
      setErrors({ ...errors, [field]: fieldError })
    }
  }

  // הוסף פונקציית ולידציה לשדה בודד
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case "groomName":
        return !value || value.trim() === "" ? "שם החתן הוא שדה חובה" : ""
      case "brideName":
        return !value || value.trim() === "" ? "שם הכלה הוא שדה חובה" : ""
      case "date":
        return !value ? "תאריך החתונה הוא שדה חובה" : ""
      case "venue":
        return !value || value.trim() === "" ? "מקום האירוע הוא שדה חובה" : ""
      case "estimatedGuests":
        if (!value) return "מספר אורחים משוער הוא שדה חובה"
        if (value <= 0) return "יש להזין מספר חיובי"
        return ""
      default:
        return ""
    }
  }

  // עדכון פונקציית nextStep כדי לבדוק ולידציה לפני מעבר לשלב הבא
  const nextStep = () => {
    // בדיקת ולידציה לפי השלב הנוכחי
    const currentStepErrors = validateStep(step)

    // אם יש שגיאות, הצג אותן ואל תמשיך לשלב הבא
    if (Object.keys(currentStepErrors).length > 0) {
      setErrors(currentStepErrors)
      // סמן את כל השדות בשלב הנוכחי כ"נגעו בהם" כדי להציג את השגיאות
      const touchedFields: Record<string, boolean> = {}
      Object.keys(currentStepErrors).forEach((field) => {
        touchedFields[field] = true
      })
      setTouched({ ...touched, ...touchedFields })
      return
    }

    // אם אין שגיאות, המשך לשלב הבא
    if (step < totalSteps) {
      setStep(step + 1)
      // נקה שגיאות מהשלב הקודם
      setErrors({})
    }
  }

  // הוסף פונקציית ולידציה לפי שלב
  const validateStep = (currentStep: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1: // שלב פרטי הזוג
        if (!weddingDetails.groomName || weddingDetails.groomName.trim() === "") {
          stepErrors.groomName = "שם החתן הוא שדה חובה"
        }
        if (!weddingDetails.brideName || weddingDetails.brideName.trim() === "") {
          stepErrors.brideName = "שם הכלה הוא שדה חובה"
        }
        break

      case 2: // שלב תאריך החתונה
        if (!weddingDetails.date) {
          stepErrors.date = "תאריך החתונה הוא שדה חובה"
        }
        break

      case 3: // שלב פרטי האירוע
        if (!weddingDetails.venue || weddingDetails.venue.trim() === "") {
          stepErrors.venue = "מקום האירוע הוא שדה חובה"
        }
        if (!weddingDetails.estimatedGuests || weddingDetails.estimatedGuests <= 0) {
          stepErrors.estimatedGuests = "מספר אורחים משוער הוא שדה חובה ויש להזין מספר חיובי"
        }
        break
    }

    return stepErrors
  }

  // עדכון פונקציית handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (step === totalSteps) {
      // בדוק ולידציה לשלב האחרון לפני שליחה סופית
      const finalStepErrors = validateStep(step)
      if (Object.keys(finalStepErrors).length > 0) {
        setErrors(finalStepErrors)
        const touchedFields: Record<string, boolean> = {}
        Object.keys(finalStepErrors).forEach((field) => {
          touchedFields[field] = true
        })
        setTouched({ ...touched, ...touchedFields })
        return
      }

      handleFinalSubmit()
    } else {
      nextStep()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONPLANJOY.jpg-ngzVtWpXnMrvdM9DxQouO2uCK6AksF.jpeg"
            alt="PlanJoy Logo"
            width={100}
            height={100}
            className="mx-auto mb-4 rounded-full animate-pulse-scale"
          />
          <div className="text-primary mt-4">טוען...</div>
        </div>
      </div>
    )
  }

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-3 h-3 rounded-full mx-1 transition-all duration-300",
              step === index + 1 ? "bg-primary scale-125" : index + 1 < step ? "bg-primary/60" : "bg-gray-300",
            )}
          />
        ))}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (step) {
      // עדכון רינדור השלבים כדי להציג שגיאות ולהשתמש בפונקציות החדשות

      // עדכון שלב 1 - פרטי הזוג
      case 1:
        return (
          <>
            <CardHeader className="bg-gradient-to-r from-primary/90 to-pink-500/90 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Heart className="mr-2 animate-pulse" /> פרטי הזוג
              </CardTitle>
              <CardDescription className="text-white/90">
                ספרו לנו קצת על עצמכם, זה הצעד הראשון לחתונה מושלמת!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="groomName">שם החתן</Label>
                  <Input
                    id="groomName"
                    placeholder="הכנס את שם החתן"
                    value={weddingDetails.groomName}
                    onChange={(e) => handleFieldChange("groomName", e.target.value)}
                    required
                    className={`border-primary/20 focus:border-primary ${errors.groomName && touched.groomName ? "border-red-500" : ""}`}
                  />
                  {errors.groomName && touched.groomName && (
                    <p className="text-red-500 text-sm mt-1">{errors.groomName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brideName">שם הכלה</Label>
                  <Input
                    id="brideName"
                    placeholder="הכנס את שם הכלה"
                    value={weddingDetails.brideName}
                    onChange={(e) => handleFieldChange("brideName", e.target.value)}
                    required
                    className={`border-primary/20 focus:border-primary ${errors.brideName && touched.brideName ? "border-red-500" : ""}`}
                  />
                  {errors.brideName && touched.brideName && (
                    <p className="text-red-500 text-sm mt-1">{errors.brideName}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={nextStep} className="px-8">
                  המשך <span className="mr-2">→</span>
                </Button>
              </div>
            </CardContent>
          </>
        )

      // עדכון שלב 2 - תאריך החתונה
      case 2:
        return (
          <>
            <CardHeader className="bg-gradient-to-r from-primary/90 to-pink-500/90 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Calendar className="mr-2 animate-pulse" /> תאריך החתונה
              </CardTitle>
              <CardDescription className="text-white/90">בחרו את היום המיוחד שלכם!</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>תאריך החתונה</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right border-primary/20 hover:bg-primary/5",
                        !weddingDetails.date && "text-muted-foreground",
                        errors.date && touched.date ? "border-red-500" : "",
                      )}
                      onClick={() => setTouched({ ...touched, date: true })}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {weddingDetails.date ? (
                        format(new Date(weddingDetails.date), "dd/MM/yyyy", { locale: he })
                      ) : (
                        <span>בחרו תאריך</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={weddingDetails.date ? new Date(weddingDetails.date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          handleFieldChange("date", date.toISOString())
                        }
                      }}
                      initialFocus
                      locale={he}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && touched.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <span className="ml-2">←</span> חזרה
                </Button>
                <Button onClick={nextStep} className="px-8">
                  המשך <span className="mr-2">→</span>
                </Button>
              </div>
            </CardContent>
          </>
        )

      // עדכון שלב 3 - פרטי האירוע
      case 3:
        return (
          <>
            <CardHeader className="bg-gradient-to-r from-primary/90 to-pink-500/90 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center">
                <MapPin className="mr-2 animate-pulse" /> פרטי האירוע
              </CardTitle>
              <CardDescription className="text-white/90">כמה פרטים אחרונים ואנחנו מתחילים!</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="venue">מקום האירוע</Label>
                <Select
                  value={weddingDetails.venue}
                  onValueChange={(value) => handleFieldChange("venue", value)}
                  required
                >
                  <SelectTrigger
                    className={`border-primary/20 ${errors.venue && touched.venue ? "border-red-500" : ""}`}
                    onClick={() => setTouched({ ...touched, venue: true })}
                  >
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
                <Label htmlFor="estimatedGuests" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" /> מספר אורחים משוער
                </Label>
                <Input
                  id="estimatedGuests"
                  type="number"
                  placeholder="הכנס מספר אורחים משוער"
                  value={weddingDetails.estimatedGuests || ""}
                  onChange={(e) => handleFieldChange("estimatedGuests", Number(e.target.value))}
                  required
                  className={`border-primary/20 focus:border-primary ${errors.estimatedGuests && touched.estimatedGuests ? "border-red-500" : ""}`}
                />
                {errors.estimatedGuests && touched.estimatedGuests && (
                  <p className="text-red-500 text-sm mt-1">{errors.estimatedGuests}</p>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <span className="ml-2">←</span> חזרה
                </Button>
                <Button type="submit" onClick={handleSubmit} className="px-8">
                  {isSubmitting ? "שומר..." : "סיום והמשך לדשבורד"}
                </Button>
              </div>
            </CardContent>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 md:p-8 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 text-primary/20 animate-float">
        <PartyPopper size={40} />
      </div>
      <div className="absolute top-40 right-20 text-pink-400/20 animate-float" style={{ animationDelay: "0.5s" }}>
        <Cake size={36} />
      </div>
      <div className="absolute bottom-40 left-20 text-primary/20 animate-float" style={{ animationDelay: "1s" }}>
        <Music size={32} />
      </div>
      <div className="absolute bottom-60 right-40 text-pink-400/20 animate-float" style={{ animationDelay: "1.5s" }}>
        <Camera size={28} />
      </div>
      <div className="absolute top-60 left-40 text-primary/20 animate-float" style={{ animationDelay: "2s" }}>
        <GlassWater size={30} />
      </div>

      {/* Sparkles */}
      <div className="absolute top-10 left-10 text-primary/20 animate-float">
        <Sparkles size={30} />
      </div>
      <div className="absolute top-20 right-20 text-pink-400/20 animate-float" style={{ animationDelay: "0.5s" }}>
        <Sparkles size={24} />
      </div>
      <div className="absolute bottom-20 left-20 text-primary/20 animate-float" style={{ animationDelay: "1s" }}>
        <Sparkles size={20} />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-pink-500/30 rounded-full blur-xl animate-pulse-slow"></div>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONPLANJOY.jpg-ngzVtWpXnMrvdM9DxQouO2uCK6AksF.jpeg"
              alt="PlanJoy Logo"
              width={128}
              height={128}
              className="mx-auto rounded-full border-4 border-white shadow-xl animate-bounce relative z-10"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">ברוכים הבאים ל-PlanJoy!</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">בואו נתחיל לתכנן את היום המיוחד שלכם</p>
        </div>

        {/* Onboarding Form */}
        <Card className="border-none shadow-xl relative overflow-hidden animate-fade-in backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-pink-500 to-primary bg-[length:200%_100%] animate-gradient"></div>

          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent()}
          </form>

          <CardFooter className="bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            <div className="w-full flex flex-col items-center">
              <p>ניתן לערוך את הפרטים בכל עת בעמוד פרטי החתונה</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  שלב {step} מתוך {totalSteps}
                </span>
                <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

