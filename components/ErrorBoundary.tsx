"use client"

import React, { type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <h1 className="text-2xl font-bold mb-4">אופס! משהו השתבש</h1>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            אנו מתנצלים על אי הנוחות. נסה לרענן את הדף או לחזור למסך הבית.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>רענן דף</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              חזור לדף הבית
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mt-8 p-4 bg-red-50 text-red-900 rounded-md max-w-2xl overflow-auto">
              <h2 className="font-bold mb-2">פרטי השגיאה (רק במצב פיתוח):</h2>
              <p className="font-mono text-sm">{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

