"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Share2, Copy, Check } from "lucide-react"
import { useAuth } from "./auth-provider"
import { useCustomToast } from "./ui/custom-toast"
import { useTranslation } from "@/hooks/useTranslation"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Update the ShareLink component to have a more compact version for the header
export function ShareLink({ compact = false }: { compact?: boolean }) {
  const { demoMode, user } = useAuth()
  const { t } = useTranslation()
  const customToast = useCustomToast()
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateShareLink = async () => {
    if (!user) return

    setIsGenerating(true)

    try {
      // יצירת מזהה ייחודי לשיתוף עם חותמת זמן
      const timestamp = new Date().getTime()
      const sharingId = `share-${timestamp}-${Math.random().toString(36).substring(2, 8)}`

      // יצירת כתובת השיתוף - ודא שימוש בכתובת מוחלטת
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"
      const shareUrl = `${baseUrl}/shared/${sharingId}`
      setShareUrl(shareUrl)

      console.log("Generated share URL:", shareUrl)
      console.log("With sharing ID:", sharingId)
      console.log("For wedding ID:", user.uid)

      // שמירת מידע השיתוף ב-Firestore אם זמין
      if (db) {
        await setDoc(doc(db, "weddingShares", sharingId), {
          weddingId: user.uid,
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
          email: user.email,
          name: `שיתוף ${new Date().toLocaleDateString("he-IL")}`,
        })
        console.log("Share document created in Firestore")
        customToast.success("שיתוף נוצר", "קישור השיתוף נוצר בהצלחה")
      } else {
        console.warn("Firestore not available, share link created but not saved")
        customToast.warning("אזהרה", "הקישור נוצר אך לא נשמר במסד הנתונים")
      }
    } catch (error) {
      console.error("Error creating share link:", error)
      customToast.error(t("errorCreatingShareLink"), t("errorCreatingShareLinkDescription"))
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    customToast.success(t("linkCopied"), t("linkCopiedDescription"))

    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  // Update the return statement to support compact mode
  if (demoMode) {
    return null // Don't show sharing option in demo mode
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => {
              setIsOpen(true)
              generateShareLink()
            }}
            disabled={isGenerating}
            title="שתף חתונה"
          >
            <Share2 className="h-5 w-5" />
            <span className="sr-only">שתף חתונה</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setIsOpen(true)
              generateShareLink()
            }}
            disabled={isGenerating}
          >
            <Share2 className="h-4 w-4" />
            {isGenerating ? "מייצר..." : "שתף חתונה"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>שתף פרטי חתונה</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 space-x-reverse mt-4">
          <div className="grid flex-1 gap-2">
            <p className="text-sm text-muted-foreground mb-2">
              שתף את הקישור הזה עם בן/בת הזוג או מארגני האירוע כדי לאפשר להם לצפות ולערוך את פרטי החתונה
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={shareUrl} className="flex-1" />
              <Button size="icon" onClick={copyToClipboard} disabled={!shareUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">כל מי שיש לו את הקישור יוכל לצפות ולערוך את פרטי החתונה שלך</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

