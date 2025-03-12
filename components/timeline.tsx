"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  status: "completed" | "upcoming" | "warning"
}

export function Timeline({ isSharedView = false }) {
  const { toast } = useToast()
  const { user, demoMode, weddingData, addItem } = useAuth()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({})

  // הוספת ולידציה לטופס הוספת אירוע

  // הוסף את המשתנים הבאים בתוך הקומפוננטה, אחרי הגדרת המשתנים הקיימים
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({})

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    if (weddingData?.timelineEvents) {
      setEvents(weddingData.timelineEvents)
    }
  }, [weddingData])

  // הוסף פונקציית ולידציה לטופס הוספת אירוע
  const validateEventForm = (event: Partial<TimelineEvent>): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!event.date) {
      errors.date = "תאריך האירוע הוא שדה חובה"
    }

    if (!event.title || event.title.trim() === "") {
      errors.title = "כותרת האירוע היא שדה חובה"
    }

    if (!event.description || event.description.trim() === "") {
      errors.description = "תיאור האירוע הוא שדה חובה"
    }

    if (!event.status) {
      errors.status = "סטטוס האירוע הוא שדה חובה"
    }

    return errors
  }

  // הוסף פונקציה לטיפול בשינוי שדה ועדכון מצב "נגעו בשדה"
  const handleEventFieldChange = (field: string, value: any) => {
    setNewEvent({ ...newEvent, [field]: value })
    setFormTouched({ ...formTouched, [field]: true })

    // בדוק ולידציה לשדה זה אם כבר נגעו בו
    if (formTouched[field]) {
      const fieldError = validateEventField(field, value)
      setFormErrors({ ...formErrors, [field]: fieldError })
    }
  }

  // הוסף פונקציית ולידציה לשדה בודד
  const validateEventField = (field: string, value: any): string => {
    switch (field) {
      case "date":
        return !value ? "תאריך האירוע הוא שדה חובה" : ""
      case "title":
        return !value || value.trim() === "" ? "כותרת האירוע היא שדה חובה" : ""
      case "description":
        return !value || value.trim() === "" ? "תיאור האירוע הוא שדה חובה" : ""
      case "status":
        return !value ? "סטטוס האירוע הוא שדה חובה" : ""
      default:
        return ""
    }
  }

  // עדכון פונקציית handleAddEvent
  const handleAddEvent = async () => {
    if (isSharedView) return

    // בדוק ולידציה
    const errors = validateEventForm(newEvent)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      // סמן את כל השדות כ"נגעו בהם"
      const allTouched: Record<string, boolean> = {}
      Object.keys(errors).forEach((field) => {
        allTouched[field] = true
      })
      setFormTouched({ ...formTouched, ...allTouched })
      return
    }

    if (newEvent.date && newEvent.title && newEvent.description && newEvent.status) {
      const eventToAdd: TimelineEvent = {
        id: Date.now().toString(),
        date: newEvent.date,
        title: newEvent.title,
        description: newEvent.description,
        status: newEvent.status as "completed" | "upcoming" | "warning",
      }

      try {
        await addItem("timelineEvents", eventToAdd)
        setNewEvent({})
        setIsAddDialogOpen(false)
        // נקה שגיאות וסימוני נגיעה
        setFormErrors({})
        setFormTouched({})
        toast({
          title: "אירוע נוסף",
          description: `${eventToAdd.title} נוסף בהצלחה לציר הזמן`,
        })
      } catch (error) {
        console.error("שגיאה בהוספת אירוע:", error)
        toast({
          title: "שגיאה בהוספת אירוע",
          description: "אירעה שגיאה בעת הוספת האירוע לציר הזמן",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ציר זמן</CardTitle>
              <CardDescription>אבני דרך ואירועים חשובים</CardDescription>
            </div>
            {!isSharedView && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    הוסף אירוע
                  </Button>
                </DialogTrigger>
                {/* עדכון הרינדור של טופס הוספת אירוע כדי להציג שגיאות */}
                {/* עדכן את הדיאלוג של הוספת אירוע */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוסף אירוע חדש</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        תאריך
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date || ""}
                        onChange={(e) => handleEventFieldChange("date", e.target.value)}
                        className={`col-span-3 ${formErrors.date && formTouched.date ? "border-red-500" : ""}`}
                      />
                      {formErrors.date && formTouched.date && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.date}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        כותרת
                      </Label>
                      <Input
                        id="title"
                        value={newEvent.title || ""}
                        onChange={(e) => handleEventFieldChange("title", e.target.value)}
                        className={`col-span-3 ${formErrors.title && formTouched.title ? "border-red-500" : ""}`}
                      />
                      {formErrors.title && formTouched.title && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.title}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        תיאור
                      </Label>
                      <Input
                        id="description"
                        value={newEvent.description || ""}
                        onChange={(e) => handleEventFieldChange("description", e.target.value)}
                        className={`col-span-3 ${formErrors.description && formTouched.description ? "border-red-500" : ""}`}
                      />
                      {formErrors.description && formTouched.description && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.description}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        סטטוס
                      </Label>
                      <Select
                        value={newEvent.status}
                        onValueChange={(value) => handleEventFieldChange("status", value as TimelineEvent["status"])}
                        onOpenChange={() => setFormTouched({ ...formTouched, status: true })}
                      >
                        <SelectTrigger
                          className={`col-span-3 ${formErrors.status && formTouched.status ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="בחר סטטוס" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">הושלם</SelectItem>
                          <SelectItem value="upcoming">קרב</SelectItem>
                          <SelectItem value="warning">אזהרה</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.status && formTouched.status && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.status}</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        setFormErrors({})
                        setFormTouched({})
                      }}
                    >
                      ביטול
                    </Button>
                    <Button onClick={handleAddEvent}>הוסף אירוע</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4">
            <div className="absolute top-0 bottom-0 right-[19px] w-px bg-muted" />
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                {event.status === "completed" ? (
                  <CheckCircle2 className="relative mt-1 h-5 w-5 text-green-500" />
                ) : event.status === "warning" ? (
                  <AlertCircle className="relative mt-1 h-5 w-5 text-yellow-500" />
                ) : (
                  <Clock className="relative mt-1 h-5 w-5 text-blue-500" />
                )}
                <div className="flex-1 grid gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{event.title}</h4>
                    <Badge variant={event.status === "completed" ? "success" : "secondary"}>{event.date}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>אין אירועים להצגה</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

