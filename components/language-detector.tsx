"use client"

import { useEffect } from "react"

export function LanguageDetector() {
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "he"
    document.documentElement.lang = savedLanguage
    document.documentElement.dir = savedLanguage === "he" ? "rtl" : "ltr"
  }, [])

  return null
}

