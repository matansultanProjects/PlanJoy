"use client"

import { MainLayout } from "@/components/main-layout"
import { Timeline } from "@/components/timeline"
import { useState, useEffect } from "react"

export default function TimelinePage() {
  const [isSharedView, setIsSharedView] = useState(false)

  useEffect(() => {
    // Check if we're in a shared view - only run on client side
    if (typeof window !== "undefined") {
      const sharedView = localStorage.getItem("viewingSharedWedding") === "true"
      setIsSharedView(sharedView)
    }
  }, [])

  return (
    <MainLayout isSharedView={isSharedView}>
      <Timeline isSharedView={isSharedView} />
    </MainLayout>
  )
}

