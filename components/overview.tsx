"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Users,
  DollarSign,
  CheckSquare,
  Calendar,
  Clock,
  AlertCircle,
  Camera,
  Edit,
  CalendarHeart,
  MapPin,
} from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useCustomToast } from "./ui/custom-toast"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface TimelineEvent {
  id: string
  title: string
  date: string
  status: "completed" | "upcoming" | "warning"
}

interface OverviewProps {
  isSharedView?: boolean
  weddingData?: any
}

export function Overview({ isSharedView = false, weddingData: propWeddingData }: OverviewProps) {
  const { user, demoMode, weddingData: contextWeddingData, updateWeddingData } = useAuth()
  const customToast = useCustomToast()
  const [weddingDetails, setWeddingDetails] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [couplePhoto, setCouplePhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Use either the prop data or context data
  const effectiveWeddingData = propWeddingData || contextWeddingData

  useEffect(() => {
    // Check if we're in shared view
    if (typeof window !== "undefined") {
      const viewingSharedWedding = localStorage.getItem("viewingSharedWedding") === "true"
      const targetWeddingId = localStorage.getItem("targetWeddingId")

      if (viewingSharedWedding && targetWeddingId && !effectiveWeddingData) {
        // Fetch the wedding data directly
        const fetchSharedWedding = async () => {
          try {
            const weddingDoc = await getDoc(doc(db, "weddings", targetWeddingId))
            if (weddingDoc.exists()) {
              const data = weddingDoc.data()
              console.log("Setting wedding data in Overview:", data)
              updateWeddingData(data)
            }
          } catch (error) {
            console.error("Error fetching shared wedding in Overview:", error)
          }
        }

        fetchSharedWedding()
      }
    }
  }, [])

  useEffect(() => {
    if (effectiveWeddingData) {
      console.log("Setting wedding data in Overview:", effectiveWeddingData)
      setWeddingDetails(effectiveWeddingData.weddingDetails)
      setGuests(effectiveWeddingData.guests || [])
      setTasks(effectiveWeddingData.tasks || [])
      setBudgetItems(effectiveWeddingData.budgetItems || [])
      setTimelineEvents(effectiveWeddingData.timelineEvents || [])
      setCouplePhoto(effectiveWeddingData.couplePhoto || null)
    }
  }, [effectiveWeddingData])

  // נעדכן את הפונקציה handleUpdateData כדי לרענן את הנתונים ממסד הנתונים
  const handleUpdateData = () => {
    // רענון הנתונים ממסד הנתונים
    if (user && !demoMode) {
      setLoading(true)
      const weddingRef = doc(db, "weddings", user.uid)
      getDoc(weddingRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data()
            console.log("Fetched wedding data:", data)
            // אין צורך לעדכן את הסטייט מקומית כי ה-listener יטפל בזה
          }
          setLoading(false)
          customToast.success("הנתונים עודכנו", "הנתונים עודכנו בהצלחה")
        })
        .catch((error) => {
          console.error("שגיאה בטעינת נתונים:", error)
          customToast.error("שגיאה בטעינת נתונים", "אירעה שגיאה בעת טעינת הנתונים. אנא נסה שוב.")
          setLoading(false)
        })
    } else {
      customToast.success("הנתונים עודכנו", "הנתונים עודכנו בהצלחה")
    }
  }

  // נעדכן את הפונקציה handlePhotoUpload כדי לשפר את הסנכרון עם מסד הנתונים
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (demoMode || !user) return

    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        setCouplePhoto(base64String)
        try {
          if (db) {
            await updateDoc(doc(db, "weddings", user.uid), { couplePhoto: base64String })

            // Update the wedding data context
            updateWeddingData({ couplePhoto: base64String })

            customToast.success("התמונה עודכנה", "תמונת הזוג עודכנה בהצלחה")
          }
        } catch (error) {
          console.error("שגיאה בעדכון התמונה:", error)
          customToast.error("שגיאה בעדכון התמונה", "אירעה שגיאה בעת עדכון התמונה")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const totalGuests = guests.reduce((sum, guest) => sum + guest.invitedCount, 0)
  const confirmedGuests = guests
    .filter((guest) => guest.confirmed === "כן")
    .reduce((sum, guest) => sum + guest.invitedCount, 0)

  const totalBudget = budgetItems.reduce((sum, item) => sum + (item.planned || 0), 0)
  const totalDeposit = budgetItems.reduce((sum, item) => sum + (item.deposit || 0), 0)

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length

  const guestRelationData = [
    { name: "משפחה", value: guests.filter((guest) => guest.relation === "משפחה").length },
    { name: "חברים", value: guests.filter((guest) => guest.relation === "חברים").length },
    { name: "עבודה", value: guests.filter((guest) => guest.relation === "עבודה").length },
  ]

  const budgetCategoryData = budgetItems.map((item) => ({
    name: item.category,
    planned: item.planned || 0,
    deposit: item.deposit || 0,
  }))

  const COLORS = ["#FF6B8B", "#46CDCF", "#3D84A8", "#ABEDD8"]

  const upcomingEvents = timelineEvents
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  // Calculate days until wedding
  const daysUntilWedding = weddingDetails?.date
    ? Math.ceil((new Date(weddingDetails.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const { weddingData } = useAuth()
  const { loading: authLoading } = useAuth()

  if (authLoading) {
    return <LoadingSpinner />
  }

  if (!weddingData) {
    return <div>אין נתונים זמינים. אנא צור חתונה חדשה.</div>
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-card">
        <div className="bg-gradient-to-r from-primary/90 to-pink-500/90 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">סקירה כללית</CardTitle>
          </CardHeader>
          <CardContent>
            {weddingDetails ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">
                    {weddingDetails.groomName} & {weddingDetails.brideName}
                  </h2>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-5 w-5" />
                    <span className="text-lg">
                      {weddingDetails.date
                        ? new Date(weddingDetails.date).toLocaleDateString("he-IL", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "לא הוגדר תאריך"}
                    </span>
                    {daysUntilWedding !== null && (
                      <Badge variant="outline" className="ml-2 bg-white/20 text-white border-white/30">
                        {daysUntilWedding} ימים נותרו
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Users className="h-5 w-5" />
                    <span className="text-lg">מספר אורחים משוער: {weddingDetails.estimatedGuests}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">מקום האירוע: {weddingDetails.venue}</span>
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  {couplePhoto ? (
                    <div className="relative">
                      <img
                        src={couplePhoto || "/placeholder.svg"}
                        alt="תמונת הזוג"
                        className="w-48 h-48 object-cover rounded-full border-4 border-white shadow-lg"
                      />
                      {!demoMode && !isSharedView && (
                        <label
                          htmlFor="photo-upload"
                          className="absolute bottom-2 right-2 cursor-pointer bg-white text-primary rounded-full p-2 shadow-md hover:bg-white/90 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                      {!demoMode && !isSharedView ? (
                        <label htmlFor="photo-upload" className="cursor-pointer text-center">
                          <Camera className="h-12 w-12 mx-auto mb-2" />
                          <span className="text-sm">הוסף תמונה</span>
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      ) : (
                        <div className="text-center">
                          <Camera className="h-12 w-12 mx-auto mb-2" />
                          <span className="text-sm">אין תמונה זמינה</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-white/80 py-6">אין פרטי חתונה עדיין. אנא הוסף פרטי חתונה.</div>
            )}
          </CardContent>
        </div>
      </Card>

      <div className="flex justify-end mb-4">
        <Button onClick={handleUpdateData} disabled={loading}>
          רענן נתונים
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכל אורחים</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <Progress value={(confirmedGuests / totalGuests) * 100 || 0} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {confirmedGuests} אישרו הגעה מתוך {totalGuests}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תקציב</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalBudget.toLocaleString()}</div>
            <Progress value={(totalDeposit / totalBudget) * 100 || 0} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              מקדמות: ₪{totalDeposit.toLocaleString()} ({((totalDeposit / totalBudget) * 100 || 0).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משימות</CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks}/{totalTasks}
            </div>
            <Progress value={(completedTasks / totalTasks) * 100 || 0} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {((completedTasks / totalTasks) * 100 || 0).toFixed(0)}% הושלמו
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אירועים קרובים</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <span className="text-sm">{event.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.date}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">אין אירועים קרובים</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="charts">נתונים וגרפים</TabsTrigger>
          <TabsTrigger value="tasks">משימות אחרונות</TabsTrigger>
        </TabsList>
        <TabsContent value="charts">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">התפלגות אורחים</CardTitle>
                <CardDescription>לפי קשר</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={guestRelationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {guestRelationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">תקציב לפי קטגוריה</CardTitle>
                <CardDescription>מתוכנן מול מקדמות</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetCategoryData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="planned" fill="#FF6B8B" name="תקציב מתוכנן" />
                      <Bar dataKey="deposit" fill="#46CDCF" name="מקדמות" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="tasks">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg">משימות אחרונות</CardTitle>
              <CardDescription>משימות קרובות</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.length > 0 ? (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          <CheckSquare className="h-5 w-5 text-success" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-warning" />
                        )}
                        <div>
                          <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                      <Badge variant={task.completed ? "success" : "outline"} className="text-xs">
                        {task.dueDate}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-6">אין משימות להצגה</p>
                )}

                {tasks.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/tasks">צפה בכל המשימות</a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="overflow-hidden border-none shadow-card bg-gradient-to-r from-secondary to-secondary/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarHeart className="h-5 w-5 text-primary" />
            <CardTitle>טיפ ליום החתונה</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            זכרו להקצות אדם אחראי שידאג לכם ביום החתונה, כך שתוכלו להתרכז בחגיגה ולא בפרטים הקטנים.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

