import { doc, setDoc } from "firebase/firestore"
import { db } from "./firebase"

export async function shareWedding(weddingId: string, createdBy: string) {
  try {
    // יצירת מזהה שיתוף ייחודי
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const shareId = `share-${timestamp}-${randomString}`

    console.log("Generated share URL:", `${window.location.origin}/shared/${shareId}`)
    console.log("With sharing ID:", shareId)
    console.log("For wedding ID:", weddingId)

    // יצירת מסמך שיתוף בפיירסטור
    await setDoc(doc(db, "weddingShares", shareId), {
      weddingId,
      createdBy,
      createdAt: new Date(),
      shareId,
    })

    console.log("Share document created in Firestore")

    return {
      success: true,
      shareId,
      shareUrl: `${window.location.origin}/shared/${shareId}`,
    }
  } catch (error) {
    console.error("Error creating share:", error)
    return {
      success: false,
      error: "Failed to create share link. Please try again.",
    }
  }
}

