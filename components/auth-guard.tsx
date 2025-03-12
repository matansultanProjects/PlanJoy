"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, demoMode, weddingData, isSharedView } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check localStorage values - only run on client side
    if (typeof window !== "undefined") {
      const viewingSharedWedding = localStorage.getItem("viewingSharedWedding") === "true"
      const isDemoMode = localStorage.getItem("demoMode") === "true"

      // Log auth state for debugging
      console.log("AuthGuard check:", {
        viewingSharedWedding,
        pathname,
        demoMode,
        storedDemoMode: isDemoMode,
        user: user ? user.email : "null",
        loading,
        weddingData: weddingData ? "exists" : "null",
      })

      // If we're in a shared view or accessing a shared page, we're authorized
      if (viewingSharedWedding || pathname.startsWith("/shared/")) {
        console.log("Authorizing based on shared status")
        setIsAuthorized(true)
        setIsCheckingAuth(false)
        return
      }

      // If we're in demo mode (from context or localStorage), we're authorized
      if (demoMode || isDemoMode) {
        console.log("Authorizing based on demo mode")
        setIsAuthorized(true)
        setIsCheckingAuth(false)
        return
      }
    }

    // If we're still loading, wait
    if (loading) {
      console.log("Still loading auth state, waiting...")
      return
    }

    // If we're logged in, check if we need onboarding
    if (user) {
      // If the user needs onboarding and isn't already on the onboarding page, redirect
      if (weddingData?.firstTimeSetup === true && pathname !== "/onboarding") {
        console.log("User needs onboarding, redirecting to onboarding page")
        router.push("/onboarding")
        setIsCheckingAuth(false)
        return
      }

      console.log("User is logged in, authorizing for all pages")
      setIsAuthorized(true)
      setIsCheckingAuth(false)
      return
    }

    // If we're not logged in and not in demo mode, redirect to login
    // But allow access to public pages
    if (!user) {
      if (pathname !== "/login" && pathname !== "/" && !pathname.startsWith("/terms") && pathname !== "/onboarding") {
        console.log("User not logged in, redirecting to login")
        router.push("/login")
      } else {
        console.log("User not logged in, but on public page, allowing access")
        setIsAuthorized(true)
      }
      setIsCheckingAuth(false)
      return
    }
  }, [user, loading, demoMode, router, pathname, weddingData])

  // Show loading spinner while checking auth
  if (isCheckingAuth || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg font-medium">טוען...</p>
      </div>
    )
  }

  // If authorized, show children
  if (isAuthorized) {
    return <>{children}</>
  }

  // Otherwise, show nothing (will redirect)
  return null
}

