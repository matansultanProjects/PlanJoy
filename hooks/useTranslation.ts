"use client"

import { useState, useEffect } from "react"
import { translations } from "@/lib/translations"

// נוודא שהשפה העברית היא ברירת המחדל
export function useTranslation() {
  const [language, setLanguage] = useState("he") // שינוי ברירת המחדל לעברית

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language") || "he"
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
      document.documentElement.dir = savedLanguage === "he" ? "rtl" : "ltr"
    }
  }, [])

  const changeLanguage = (newLanguage: "he" | "en") => {
    setLanguage(newLanguage)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage)
      document.documentElement.lang = newLanguage
      document.documentElement.dir = newLanguage === "he" ? "rtl" : "ltr"
      window.location.reload() // רענון הדף כדי להחיל את השינויים בכל מקום
    }
  }

  const t = (key: string, variables?: Record<string, string>) => {
    let text = translations[language as "he" | "en"][key] || key

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        text = text.replace(new RegExp(`{{${key}}}`, "g"), value)
      })
    }

    return text
  }

  return { t, language, changeLanguage }
}

