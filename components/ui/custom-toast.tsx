"use client"

import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastOptions {
  title: string
  description?: string
  type?: ToastType
}

export function useCustomToast() {
  const { toast } = useToast()

  const showToast = ({ title, description, type = "info" }: ToastOptions) => {
    const icons = {
      success: <CheckCircle className="h-5 w-5 text-success" />,
      error: <XCircle className="h-5 w-5 text-destructive" />,
      warning: <AlertCircle className="h-5 w-5 text-warning" />,
      info: <Info className="h-5 w-5 text-info" />,
    }

    const variants = {
      success: "border-l-4 border-l-success bg-success/10",
      error: "border-l-4 border-l-destructive bg-destructive/10",
      warning: "border-l-4 border-l-warning bg-warning/10",
      info: "border-l-4 border-l-info bg-info/10",
    }

    // בדיקה אם יש כבר הודעה זהה מוצגת
    const existingToasts = toast.toasts || []
    const isDuplicate = existingToasts.some((t) => t.title === title && t.description === description)

    // אם זו הודעה כפולה, לא נציג אותה
    if (isDuplicate) {
      console.log("Preventing duplicate toast:", { title, description, type })
      return
    }

    // שימוש במערכת ההודעות המובנית
    toast({
      title,
      description,
      variant: "default",
      className: variants[type],
      icon: icons[type],
    })
  }

  return {
    success: (title: string, description?: string) => showToast({ title, description, type: "success" }),
    error: (title: string, description?: string) => showToast({ title, description, type: "error" }),
    warning: (title: string, description?: string) => showToast({ title, description, type: "warning" }),
    info: (title: string, description?: string) => showToast({ title, description, type: "info" }),
  }
}

