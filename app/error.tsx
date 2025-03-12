"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

// Ensure correct error page props
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">משהו השתבש!</h2>
      <Button onClick={() => reset()} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
        נסה שוב
      </Button>
    </div>
  )
}

