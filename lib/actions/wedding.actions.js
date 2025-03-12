import { db } from "../firebase"
import { doc, setDoc } from "firebase/firestore"

export const createWedding = async (weddingDetails) => {
  try {
    const userId = weddingDetails.userId
    if (!userId) {
      throw new Error("User ID is required to create a wedding")
    }

    const weddingRef = doc(db, "weddings", userId)
    await setDoc(weddingRef, {
      ...weddingDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    console.log("Wedding created successfully for user:", userId)
    return { success: true, message: "Wedding created successfully!" }
  } catch (error) {
    console.error("Error creating wedding:", error)
    return { success: false, message: "Failed to create wedding. Please try again." }
  }
}

