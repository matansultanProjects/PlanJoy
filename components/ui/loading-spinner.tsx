"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState, useEffect } from "react"

type SpinnerSize = "small" | "medium" | "large"

interface LoadingSpinnerProps {
  size?: SpinnerSize
  className?: string
}

const sizeClasses = {
  small: "h-6 w-6",
  medium: "h-10 w-10",
  large: "h-16 w-16",
}

export default function LoadingSpinner({ size = "medium", className }: LoadingSpinnerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("animate-spin", sizeClasses[size], className)}>
        <div className="h-full w-full rounded-full border-2 border-t-transparent border-primary" />
      </div>
    )
  }

  return (
    <div className={cn("animate-spin", sizeClasses[size], className)}>
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONPLANJOY.jpg-PfiC8mCcUQSunBPuIuVbMoTKlVb5DC.jpeg"
        alt="PlanJoy Logo"
        width={sizeClasses[size] === "small" ? 24 : sizeClasses[size] === "medium" ? 40 : 64}
        height={sizeClasses[size] === "small" ? 24 : sizeClasses[size] === "medium" ? 40 : 64}
        className="rounded-full animate-pulse-scale"
        onError={(e) => {
          // Fallback to a simple spinner if image fails to load
          const target = e.target as HTMLImageElement
          target.style.display = "none"
          const parent = target.parentElement
          if (parent) {
            parent.classList.add("border-2", "border-primary", "border-t-transparent", "rounded-full")
          }
        }}
      />
    </div>
  )
}

