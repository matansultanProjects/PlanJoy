"use client"

import { useTranslation as useNextTranslation } from "next-i18next"
import { useRouter } from "next/navigation"

export function useTranslation() {
  const { t, i18n } = useNextTranslation()
  const router = useRouter()

  const changeLanguage = (lang: string) => {
    if (typeof lang !== "string" || lang.length === 0) {
      console.error("Invalid language value:", lang)
      return
    }

    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Use a more robust way to construct the URL
      const url = new URL(window.location.href)
      url.searchParams.set("lang", lang)
      window.location.href = url.toString()
    } else {
      console.warn("Attempted to change language in a non-browser environment")
    }
  }

  return { t, changeLanguage }
}

export function t(key: string) {
  const { t } = useNextTranslation()
  return t(key)
}

