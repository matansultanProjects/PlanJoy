"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import {
  onAuthStateChanged,
  type User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  signInAnonymously,
} from "firebase/auth"
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore"
import {
  dummyWeddingDetails,
  dummyGuests,
  dummyTasks,
  dummyBudgetItems,
  dummyVendors,
  dummyTimelineEvents,
  dummyTables,
} from "@/lib/dummyData"

// Define a type for the wedding data
interface WeddingData {
  weddingDetails?: any
  guests?: any[]
  tasks?: any[]
  budgetItems?: any[]
  vendors?: any[]
  timelineEvents?: any[]
  tables?: any[]
  couplePhoto?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  demoMode: boolean
  weddingData: WeddingData | null
  sharedWeddingId: string | null
  isSharedView: boolean
  signIn: () => Promise<{ isNewUser: boolean }>
  signOut: () => Promise<void>
  enableDemoMode: () => void
  addItem: (collection: string, item: any) => Promise<void>
  updateItem: (collection: string, item: any) => Promise<void>
  deleteItem: (collection: string, id: string) => Promise<void>
  updateWeddingData: (data: Partial<WeddingData>, showToast?: boolean) => Promise<void>
  saveAllData: () => Promise<void>
  checkSharedAccess: (shareId: string) => Promise<boolean>
  setWeddingData: (data: WeddingData) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

const FirebaseFallback = () => {
  return (
    <div>
      <h1>Firebase Initialization Error</h1>
      <p>There was an error initializing Firebase. Please check your Firebase configuration and try again.</p>
    </div>
  )
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [weddingDataState, setWeddingDataState] = useState<WeddingData | null>(null)
  const [sharedWeddingId, setSharedWeddingId] = useState<string | null>(null)
  const [isSharedView, setIsSharedView] = useState(false)
  const [firebaseError, setFirebaseError] = useState(false)
  const router = useRouter()

  // Initialize with demo data if in demo mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDemoMode = localStorage.getItem("demoMode") === "true"
      setDemoMode(storedDemoMode)

      if (storedDemoMode) {
        // Only set dummy data in demo mode
        setWeddingDataState({
          weddingDetails: dummyWeddingDetails,
          guests: dummyGuests,
          tasks: dummyTasks,
          budgetItems: dummyBudgetItems,
          vendors: dummyVendors,
          timelineEvents: dummyTimelineEvents,
          tables: dummyTables,
        })
        setLoading(false)
      }

      // Check for shared wedding view
      const viewingSharedWedding = localStorage.getItem("viewingSharedWedding") === "true"
      const storedSharedId = localStorage.getItem("sharedWeddingId")
      if (viewingSharedWedding && storedSharedId) {
        setSharedWeddingId(storedSharedId)
        setIsSharedView(true)

        // If we're in shared view but not logged in, sign in anonymously
        if (!user && !demoMode) {
          signInAnonymously(auth).catch((error) => {
            console.error("Error signing in anonymously:", error)
          })
        }
      }
    }
  }, [user, demoMode])

  // Set up auth state listener
  useEffect(() => {
    if (demoMode) return

    try {
      // Check if Firebase auth is properly initialized
      if (!auth || typeof auth.onAuthStateChanged !== "function") {
        console.error("Firebase auth not properly initialized")
        setLoading(false)
        return () => {}
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user)

        // Check if we're in shared view
        const viewingSharedWedding = localStorage.getItem("viewingSharedWedding") === "true"
        const storedSharedId = localStorage.getItem("sharedWeddingId")
        const targetWeddingId = localStorage.getItem("targetWeddingId")

        if (viewingSharedWedding && storedSharedId && targetWeddingId) {
          setIsSharedView(true)
          setSharedWeddingId(storedSharedId)

          try {
            // שימוש ב-getDoc במקום onSnapshot לחתונות משותפות
            console.log(`Loading shared wedding: ${targetWeddingId}`)
            const weddingDoc = await getDoc(doc(db, "weddings", targetWeddingId))

            if (weddingDoc.exists()) {
              console.log("Shared wedding document loaded successfully")
              setWeddingDataState(weddingDoc.data() as WeddingData)
            } else {
              console.error("Shared wedding document does not exist")
            }
            setLoading(false)
          } catch (error) {
            console.error("Error loading shared wedding:", error)
            setLoading(false)
          }
          return
        }

        if (user && db) {
          try {
            // Set up listener for wedding data for the logged-in user
            const weddingRef = doc(db, "weddings", user.uid)
            const unsubWedding = onSnapshot(
              weddingRef,
              (doc) => {
                if (doc.exists()) {
                  setWeddingDataState(doc.data() as WeddingData)
                } else {
                  // Create wedding document if it doesn't exist with empty data
                  setDoc(weddingRef, {
                    weddingDetails: {
                      groomName: "",
                      brideName: "",
                      date: "",
                      venue: "",
                      estimatedGuests: 100,
                    },
                    guests: [],
                    tasks: [],
                    budgetItems: [],
                    vendors: [],
                    timelineEvents: [],
                    tables: [],
                    firstTimeSetup: true,
                    createdAt: new Date().toISOString(),
                  })
                }
                setLoading(false)
              },
              (error) => {
                console.error("Error listening to wedding data:", error)
                setLoading(false)
              },
            )

            return () => unsubWedding()
          } catch (error) {
            console.error("Error setting up wedding data listener:", error)
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setLoading(false)
      return () => {}
    }
  }, [demoMode])

  // Sign in with Google
  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const isNewUser = result.additionalUserInfo?.isNewUser || false

      if (isNewUser) {
        // Create a basic wedding document for the new user
        const weddingRef = doc(db, "weddings", result.user.uid)
        await setDoc(weddingRef, {
          weddingDetails: {
            groomName: "",
            brideName: "",
            date: "",
            venue: "",
            estimatedGuests: 100,
          },
          guests: [],
          tasks: [],
          budgetItems: [],
          vendors: [],
          timelineEvents: [],
          tables: [],
          firstTimeSetup: true, // Flag to indicate onboarding is needed
          createdAt: new Date().toISOString(),
        })

        return { isNewUser: true }
      } else {
        // For existing users, check if they need to complete onboarding
        const weddingRef = doc(db, "weddings", result.user.uid)
        const weddingDoc = await getDoc(weddingRef)

        if (weddingDoc.exists()) {
          const weddingData = weddingDoc.data()
          // If firstTimeSetup is true, they need onboarding
          if (weddingData.firstTimeSetup === true) {
            return { isNewUser: true }
          }
        } else {
          // If no wedding document exists, create one and mark for onboarding
          await setDoc(weddingRef, {
            weddingDetails: {
              groomName: "",
              brideName: "",
              date: "",
              venue: "",
              estimatedGuests: 100,
            },
            guests: [],
            tasks: [],
            budgetItems: [],
            vendors: [],
            timelineEvents: [],
            tables: [],
            firstTimeSetup: true,
            createdAt: new Date().toISOString(),
          })
          return { isNewUser: true }
        }
      }

      return { isNewUser: false }
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      // Clear shared wedding data
      if (typeof window !== "undefined") {
        localStorage.removeItem("viewingSharedWedding")
        localStorage.removeItem("sharedWeddingId")
        localStorage.removeItem("targetWeddingId")
      }
      setIsSharedView(false)
      setSharedWeddingId(null)

      if (auth && typeof auth.signOut === "function") {
        await firebaseSignOut(auth)
      }
      setUser(null)
      setWeddingDataState(null)

      // Use setTimeout to ensure this runs after hydration
      setTimeout(() => {
        router.push("/")
      }, 0)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Enable demo mode
  const enableDemoMode = () => {
    setDemoMode(true)
    if (typeof window !== "undefined") {
      localStorage.setItem("demoMode", "true")
    }
    setWeddingDataState({
      weddingDetails: dummyWeddingDetails,
      guests: dummyGuests,
      tasks: dummyTasks,
      budgetItems: dummyBudgetItems,
      vendors: dummyVendors,
      timelineEvents: dummyTimelineEvents,
      tables: dummyTables,
    })

    // Use setTimeout to ensure this runs after hydration
    setTimeout(() => {
      router.push("/dashboard")
    }, 0)
  }

  // Add item to a collection
  const addItem = async (collectionName: string, item: any) => {
    if (demoMode) {
      // In demo mode, just update the local state
      setWeddingDataState((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          [collectionName]: [...(prev[collectionName] || []), item],
        }
      })
      return
    }

    if (!user || !db) {
      throw new Error("User not authenticated or database not available")
    }

    try {
      const weddingRef = doc(db, "weddings", user.uid)
      const weddingDoc = await getDoc(weddingRef)

      if (weddingDoc.exists()) {
        const currentData = weddingDoc.data()
        const updatedCollection = [...(currentData[collectionName] || []), item]

        await updateDoc(weddingRef, {
          [collectionName]: updatedCollection,
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error(`Error adding item to ${collectionName}:`, error)
      throw error
    }
  }

  // Update item in a collection
  const updateItem = async (collectionName: string, item: any) => {
    if (demoMode) {
      // In demo mode, just update the local state
      setWeddingDataState((prev) => {
        if (!prev) return prev
        const updatedCollection = (prev[collectionName] || []).map((i: any) => (i.id === item.id ? item : i))
        return {
          ...prev,
          [collectionName]: updatedCollection,
        }
      })
      return
    }

    if (!user || !db) {
      throw new Error("User not authenticated or database not available")
    }

    try {
      const weddingRef = doc(db, "weddings", user.uid)
      const weddingDoc = await getDoc(weddingRef)

      if (weddingDoc.exists()) {
        const currentData = weddingDoc.data()
        const updatedCollection = (currentData[collectionName] || []).map((i: any) => (i.id === item.id ? item : i))

        await updateDoc(weddingRef, {
          [collectionName]: updatedCollection,
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error(`Error updating item in ${collectionName}:`, error)
      throw error
    }
  }

  // Delete item from a collection
  const deleteItem = async (collectionName: string, id: string) => {
    if (demoMode) {
      // In demo mode, just update the local state
      setWeddingDataState((prev) => {
        if (!prev) return prev
        const updatedCollection = (prev[collectionName] || []).filter((i: any) => i.id !== id)
        return {
          ...prev,
          [collectionName]: updatedCollection,
        }
      })
      return
    }

    if (!user || !db) {
      throw new Error("User not authenticated or database not available")
    }

    try {
      const weddingRef = doc(db, "weddings", user.uid)
      const weddingDoc = await getDoc(weddingRef)

      if (weddingDoc.exists()) {
        const currentData = weddingDoc.data()
        const updatedCollection = (currentData[collectionName] || []).filter((i: any) => i.id !== id)

        await updateDoc(weddingRef, {
          [collectionName]: updatedCollection,
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error(`Error deleting item from ${collectionName}:`, error)
      throw error
    }
  }

  // Update wedding data
  const updateWeddingData = async (data: Partial<WeddingData>, showToast = true) => {
    if (demoMode) {
      // In demo mode, just update the local state
      setWeddingDataState((prev) => {
        if (!prev) return data as WeddingData
        return { ...prev, ...data }
      })
      return
    }

    if (!user || !db) {
      throw new Error("User not authenticated or database not available")
    }

    try {
      const weddingRef = doc(db, "weddings", user.uid)
      await updateDoc(weddingRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating wedding data:", error)
      throw error
    }
  }

  // Save all data
  const saveAllData = async () => {
    // Access weddingDataState instead of undeclared weddingData
    const weddingData = weddingDataState

    if (demoMode) {
      throw new Error("Cannot save data in demo mode")
    }

    if (!user || !db || !weddingData) {
      throw new Error("User not authenticated, database not available, or no data to save")
    }

    try {
      const weddingRef = doc(db, "weddings", user.uid)
      await setDoc(weddingRef, {
        ...weddingData,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error saving all data:", error)
      throw error
    }
  }

  // Check shared access - completely rewritten to fix the permission issues
  const checkSharedAccess = async (shareId: string) => {
    if (!db) {
      console.error("Database not available")
      return false
    }

    try {
      // Sign in anonymously if not already signed in
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth)
          console.log("התחברות אנונימית הצליחה")
        } catch (signInError) {
          console.error("שגיאה בהתחברות אנונימית:", signInError)
          return false
        }
      }

      // Get the share document
      const shareDoc = await getDoc(doc(db, "weddingShares", shareId))

      if (!shareDoc.exists()) {
        console.error("Share document does not exist")
        return false
      }

      const shareData = shareDoc.data()
      const weddingId = shareData.weddingId
      console.log(`Share document found, wedding ID: ${weddingId}`)

      // Store shared wedding info in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("viewingSharedWedding", "true")
        localStorage.setItem("sharedWeddingId", shareId)
        localStorage.setItem("targetWeddingId", weddingId)
      }

      setSharedWeddingId(shareId)
      setIsSharedView(true)

      // Get the wedding document directly with a single getDoc call
      try {
        console.log(`Attempting to access wedding document: ${weddingId}`)
        const weddingDoc = await getDoc(doc(db, "weddings", weddingId))

        if (weddingDoc.exists()) {
          console.log("Wedding document accessed successfully")
          // Set the wedding data directly from the document
          setWeddingDataState(weddingDoc.data() as WeddingData)
          setLoading(false)
          return true
        } else {
          console.error("Shared wedding document does not exist")
          setLoading(false)
          return false
        }
      } catch (docError) {
        console.error("Error fetching wedding document:", docError)
        return false
      }
    } catch (error) {
      console.error("Error checking shared access:", error)
      return false
    }
  }

  const setWeddingData = (data: WeddingData) => {
    setWeddingDataState(data)
  }

  const value: AuthContextType = {
    user,
    loading,
    demoMode,
    weddingData: weddingDataState,
    sharedWeddingId,
    isSharedView,
    signIn,
    signOut,
    enableDemoMode,
    addItem,
    updateItem,
    deleteItem,
    updateWeddingData,
    saveAllData,
    checkSharedAccess,
    setWeddingData,
  }

  if (firebaseError) {
    return <FirebaseFallback />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

