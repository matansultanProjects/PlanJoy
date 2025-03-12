"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "../ui/LoadingSpinner"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isSharedView } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log("AuthGuard check:", { user, loading, isSharedView, pathname })

    // רשימת נתיבים שלא דורשים הרשאה
    const publicPaths = ["/", "/login", "/signup", "/reset-password"]
    const isPublicPath = publicPaths.includes(pathname)

    if (loading) {
      // עדיין טוען - לא עושים כלום
      return
    }

    if (isPublicPath) {
      // נתיב ציבורי - תמיד מורשה
      console.log("Public path, always authorized")
      setIsAuthorized(true)
      return
    }

    if (user) {
      // משתמש מחובר - מורשה לכל הנתיבים
      console.log("User is logged in, authorizing for all pages")
      setIsAuthorized(true)
      return
    }

    if (isSharedView && pathname.startsWith("/dashboard")) {
      // מצב שיתוף ונתיב דשבורד - מורשה
      console.log("Authorizing based on shared status")
      setIsAuthorized(true)
      return
    }

    // כל מקרה אחר - לא מורשה, הפניה לדף הכניסה
    console.log("Not authorized, redirecting to login")
    setIsAuthorized(false)
    router.push("/login")
  }, [user, loading, isSharedView, pathname, router])

  // מציג טעינה כאשר עדיין לא יודעים אם מורשה
  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // מציג את התוכן רק אם מורשה
  return isAuthorized ? <>{children}</> : null
}

