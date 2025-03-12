"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useCustomToast } from "@/components/ui/custom-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { SupportChat } from "@/components/support-chat"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const router = useRouter()
  const customToast = useCustomToast()
  const { signIn, enableDemoMode, demoMode } = useAuth()

  // Auto-redirect to dashboard if already in demo mode
  useEffect(() => {
    if (demoMode) {
      router.push("/dashboard")
    }
  }, [demoMode, router])

  const handleSignIn = async () => {
    if (!acceptedTerms) {
      customToast.warning("תנאי שימוש", "יש לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך")
      return
    }
    setIsLoading(true)
    setAuthError(null)
    try {
      const result = await signIn()
      if (result.isNewUser) {
        router.push("/onboarding")
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.code === "auth/unauthorized-domain") {
        setAuthError("This domain is not authorized for authentication. Using demo mode instead.")
        customToast.error("שגיאת התחברות", "דומיין לא מורשה לאימות. עובר למצב הדגמה.")
        setTimeout(() => enableDemoMode(), 1500)
      } else if (error.code === "auth/invalid-api-key") {
        setAuthError("Invalid API key. Using demo mode instead.")
        customToast.error("שגיאת התחברות", "מפתח API לא תקין. עובר למצב הדגמה.")
        setTimeout(() => enableDemoMode(), 1500)
      } else {
        setAuthError(error.message || "An error occurred during login. Using demo mode instead.")
        customToast.error("שגיאת התחברות", "אירעה שגיאה בעת ההתחברות. עובר למצב הדגמה.")
        setTimeout(() => enableDemoMode(), 1500)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    if (!acceptedTerms) {
      customToast.warning("תנאי שימוש", "יש לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך")
      return
    }
    enableDemoMode()
  }

  // Sanitize input to prevent SQL injection and XSS attacks
  const sanitizeInput = (input: string): string => {
    if (!input) return input

    // Remove potentially dangerous characters
    return input
      .replace(/['"\\;]/g, "") // Remove SQL injection characters
      .replace(/<[^>]*>/g, "") // Remove HTML tags to prevent XSS
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-secondary to-secondary p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/90 to-pink-500/90 text-white p-6 text-center">
            <div className="mb-4 relative w-24 h-24 mx-auto">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONPLANJOY.jpg-PfiC8mCcUQSunBPuIuVbMoTKlVb5DC.jpeg"
                alt="PlanJoy Logo"
                layout="fill"
                objectFit="contain"
                className="animate-float animate-pulse-scale rounded-full"
              />
            </div>
            <h1 className="text-3xl font-bold">PlanJoy - מתכנן החתונה שלך</h1>
            <p className="text-white/80 mt-2">התחבר כדי להתחיל לתכנן את היום המיוחד שלך</p>
          </div>
          <CardContent className="p-6 pt-8">
            <div className="space-y-4">
              {authError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>שגיאת התחברות</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 h-12"
              >
                <Image
                  src="/placeholder.svg?height=20&width=20"
                  alt="Google"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                {isLoading ? "מתחבר..." : "התחבר עם Google"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">אפשר לנסות קודם מצב הדגמה </span>
                </div>
              </div>

              <Button onClick={handleDemoLogin} variant="outline" className="w-full h-12">
                כניסה במצב הדגמה
              </Button>
            </div>
          </CardContent>
          <div className="flex items-center space-x-2 space-x-reverse mt-4 px-6">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              אני מסכים/ה ל
              <Link href="/terms" className="text-primary hover:underline mx-1">
                תנאי השימוש ומדיניות הפרטיות
              </Link>
              של PlanJoy
            </label>
          </div>
          <CardFooter className="flex flex-col items-center p-6 pt-0 gap-4">
            <p className="text-sm text-muted-foreground text-center">
              בלחיצה על "התחבר", אתה מסכים לתנאי השימוש ולמדיניות הפרטיות שלנו.
            </p>
          </CardFooter>
        </Card>
      </div>
      <SupportChat />
    </div>
  )
}

