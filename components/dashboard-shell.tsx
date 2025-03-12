"use client"

import { useEffect, useState } from "react"
import { getDoc, doc } from "firebase/firestore"
import { db } from "../firebase" // Assuming you have a firebase config file
import type { WeddingData } from "../types" // Assuming you have a WeddingData type defined

// הוסף את הקוד הבא בתחילת הקומפוננטה DashboardShell
// (אם הקובץ הזה קיים במערכת)

useEffect(() => {
  // Check if we're in shared view
  const viewingSharedWedding = localStorage.getItem("viewingSharedWedding") === "true"
  const targetWeddingId = localStorage.getItem("targetWeddingId")
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null)

  if (viewingSharedWedding && targetWeddingId) {
    // Fetch the wedding data directly
    const fetchSharedWedding = async () => {
      try {
        const weddingDoc = await getDoc(doc(db, "weddings", targetWeddingId))
        if (weddingDoc.exists()) {
          console.log("Setting wedding data in DashboardShell:", weddingDoc.data())
          setWeddingData(weddingDoc.data() as WeddingData)
        }
      } catch (error) {
        console.error("Error fetching shared wedding in DashboardShell:", error)
      }
    }

    fetchSharedWedding()
  }
}, [])

