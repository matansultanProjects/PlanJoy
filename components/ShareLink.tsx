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

export function ShareLink() {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { user, weddingData } = useAuth()
  const { t } = useTranslation()
  const customToast = useCustomToast()

  const generateShareLink = async () => {
    if (!user || !weddingData) return

    setIsGenerating(true)

    try {
      const shareId = `share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const shareUrl = `${window.location.origin}/shared/${shareId}`

      // Save share information to Firestore
      await setDoc(doc(db, "weddingShares", shareId), {
        weddingId: user.uid,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        isActive: true,
      })

      setShareUrl(shareUrl)
      setIsOpen(true)
      customToast.success(t("shareCreated"), t("shareCreatedDescription"))
    } catch (error) {
      console.error("Error creating share:", error)
      customToast.error(t("shareError"), t("shareErrorDescription"))
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      customToast.success(t("linkCopied"), t("linkCopiedDescription"))
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" onClick={generateShareLink} disabled={isGenerating}>
          <Share2 className="h-4 w-4" />
          {isGenerating ? t("generating") : t("shareWedding")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("shareWeddingDetails")}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 space-x-reverse mt-4">
          <div className="grid flex-1 gap-2">
            <p className="text-sm text-muted-foreground mb-2">{t("shareWeddingDescription")}</p>
            <div className="flex items-center gap-2">
              <Input readOnly value={shareUrl || ""} className="flex-1" />
              <Button size="icon" onClick={copyToClipboard} disabled={!shareUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{t("shareWeddingNote")}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

