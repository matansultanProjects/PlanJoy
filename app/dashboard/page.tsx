"use client"

import { MainLayout } from "@/components/main-layout"
import { Overview } from "@/components/overview"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [isSharedView, setIsSharedView] = useState(false)
  const { user, loading, demoMode } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && !demoMode) {
      router.push("/login")
    }
    // Check if we're in a shared view - only run on client side
    if (typeof window !== "undefined") {
      const sharedView = localStorage.getItem("viewingSharedWedding") === "true"
      setIsSharedView(sharedView)
      console.log("Dashboard page - shared view:", sharedView)
    }
  }, [user, loading, demoMode, router])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <MainLayout isSharedView={isSharedView}>
      <Overview isSharedView={isSharedView} />
    </MainLayout>
  )
}

