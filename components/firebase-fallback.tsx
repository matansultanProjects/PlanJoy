"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function FirebaseFallback() {
  const router = useRouter()

  const enableDemoMode = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("demoMode", "true")
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary to-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Firebase Connection Issue</CardTitle>
          <CardDescription>We're having trouble connecting to our backend services.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This could be due to:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Network connectivity issues</li>
            <li>Firebase configuration issues</li>
            <li>Temporary service disruption</li>
          </ul>
          <p>
            You can try again later or continue in demo mode to explore the application's features without saving data.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Return Home
          </Button>
          <Button onClick={enableDemoMode}>Continue in Demo Mode</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

