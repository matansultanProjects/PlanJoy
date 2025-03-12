"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Download, Upload, Edit, Trash, Filter, Check, X } from "lucide-react"
import type { Guest } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as XLSX from "xlsx"
import { useCustomToast } from "@/components/ui/custom-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"

interface GuestListProps {
  isSharedView?: boolean
}

export function GuestList({ isSharedView = false }: GuestListProps) {
  const customToast = useCustomToast()
  const { weddingData, addItem, updateItem, deleteItem } = useAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRelation, setFilterRelation] = useState<string | null>(null)
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({})
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})

  // הוספת ולידציה לטופס הוספת אורח

  // הוסף את המשתנים הבאים בתוך הקומפוננטה, אחרי הגדרת המשתנים הקיימים
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({})

  // הוסף פונקציית ולידציה לטופס הוספת אורח
  const validateGuestForm = (guest: Partial<Guest>): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!guest.fullName || guest.fullName.trim() === "") {
      errors.fullName = "שם האורח הוא שדה חובה"
    }

    if (guest.phoneNumber && !/^[0-9\-+\s()]*$/.test(guest.phoneNumber)) {
      errors.phoneNumber = "מספר טלפון לא תקין"
    }

    if (!guest.relation) {
      errors.relation = "יש לבחור קשר"
    }

    if (!guest.invitedCount || guest.invitedCount <= 0) {
      errors.invitedCount = "יש להזין מספר אורחים חיובי"
    }

    if (!guest.confirmed) {
      errors.confirmed = "יש לבחור סטטוס אישור"
    }

    return errors
  }

  useEffect(() => {
    if (weddingData?.guests) {
      setGuests(weddingData.guests)
    }
  }, [weddingData])

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isSharedView) return

    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Partial<Guest>[]

        const newGuests = jsonData.map((guest) => ({
          id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fullName: guest["שם מלא"] || "",
          phoneNumber: guest["מספר טלפון"] || "",
          relation: (guest["קשר (משפחה/חברים/עבודה)"] || "חברים") as Guest["relation"],
          invitedCount: guest["כמות מוזמנים"] || 1,
          confirmed: (guest["אישור הגעה (כן/לא/אולי)"] || "אולי") as Guest["confirmed"],
          specialNotes: guest["הערות מיוחדות"] || "",
        }))

        // Add each guest individually to avoid duplicates
        for (const guest of newGuests) {
          try {
            await addItem("guests", guest)
          } catch (error) {
            console.error("Error adding imported guest:", error)
          }
        }

        customToast.success("ייבוא הצליח", `${newGuests.length} אורחים יובאו בהצלחה`)
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      guests.map((guest) => ({
        "שם מלא": guest.fullName,
        "מספר טלפון": guest.phoneNumber,
        "קשר (משפחה/חברים/עבודה)": guest.relation,
        "כמות מוזמנים": guest.invitedCount,
        "אישור הגעה (כן/לא/אולי)": guest.confirmed,
        "הערות מיוחדות": guest.specialNotes,
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guests")
    XLSX.writeFile(workbook, "wedding_guests.xlsx")
  }

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || guest.phoneNumber.includes(searchTerm)
    const matchesFilter = !filterRelation || filterRelation === "כל הקשרים" || guest.relation === filterRelation
    return matchesSearch && matchesFilter
  })

  // עדכון פונקציית handleAddGuest
  const handleAddGuest = async () => {
    if (isSharedView) return

    // בדוק ולידציה
    const errors = validateGuestForm(newGuest)
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

    if (newGuest.fullName) {
      const guestToAdd: Guest = {
        id: Date.now().toString(),
        fullName: newGuest.fullName,
        phoneNumber: newGuest.phoneNumber || "",
        relation: (newGuest.relation as Guest["relation"]) || "חברים",
        invitedCount: newGuest.invitedCount || 1,
        confirmed: (newGuest.confirmed as Guest["confirmed"]) || "אולי",
        specialNotes: newGuest.specialNotes || "",
      }

      try {
        await addItem("guests", guestToAdd)
        setNewGuest({})
        setIsAddDialogOpen(false)
        // נקה שגיאות וסימוני נגיעה
        setFormErrors({})
        setFormTouched({})
        customToast.success("אורח נוסף", `האורח ${guestToAdd.fullName} נוסף בהצלחה`)
      } catch (error) {
        console.error("שגיאה בהוספת אורח:", error)
        customToast.error("שגיאה בהוספת אורח", "אירעה שגיאה בעת הוספת אורח")
      }
    }
  }

  // הוסף פונקציה לטיפול בשינוי שדה ועדכון מצב "נגעו בשדה"
  const handleGuestFieldChange = (field: string, value: any) => {
    setNewGuest({ ...newGuest, [field]: value })
    setFormTouched({ ...formTouched, [field]: true })

    // בדוק ולידציה לשדה זה אם כבר נגעו בו
    if (formTouched[field]) {
      const fieldError = validateGuestField(field, value)
      setFormErrors({ ...formErrors, [field]: fieldError })
    }
  }

  // הוסף פונקציית ולידציה לשדה בודד
  const validateGuestField = (field: string, value: any): string => {
    switch (field) {
      case "fullName":
        return !value || value.trim() === "" ? "שם האורח הוא שדה חובה" : ""
      case "phoneNumber":
        return value && !/^[0-9\-+\s()]*$/.test(value) ? "מספר טלפון לא תקין" : ""
      case "relation":
        return !value ? "יש לבחור קשר" : ""
      case "invitedCount":
        if (!value) return "יש להזין מספר אורחים"
        if (Number(value) <= 0) return "יש להזין מספר חיובי"
        return ""
      case "confirmed":
        return !value ? "יש לבחור סטטוס אישור" : ""
      default:
        return ""
    }
  }

  const handleEditGuest = (guest: Guest) => {
    if (isSharedView) return

    setEditingGuest(guest)
    setIsEditDialogOpen(true)
  }

  const handleUpdateGuest = async () => {
    if (isSharedView || !editingGuest) return

    try {
      await updateItem("guests", editingGuest)
      setEditingGuest(null)
      setIsEditDialogOpen(false)
      customToast.success("אורח עודכן", "פרטי האורח עודכנו בהצלחה")
    } catch (error) {
      console.error("שגיאה בעדכון אורח:", error)
      customToast.error("שגיאה בעדכון אורח", "אירעה שגיאה בעת עדכון פרטי האורח")
    }
  }

  const handleDeleteGuest = async (id: string) => {
    if (isSharedView) return

    const guestName = guests.find((g) => g.id === id)?.fullName
    try {
      await deleteItem("guests", id)
      customToast.success("אורח הוסר", `האורח ${guestName} הוסר בהצלחה`)
    } catch (error) {
      console.error("שגיאה במחיקת אורח:", error)
      customToast.error("שגיאה במחיקת אורח", "אירעה שגיאה בעת מחיקת האורח")
    }
  }

  const toggleEditMode = (id: string) => {
    setEditMode((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleInlineEdit = async (guest: Guest, field: keyof Guest, value: any) => {
    if (isSharedView) return

    // בדיקה אם הערך השתנה בכלל
    if (guest[field] === value) {
      toggleEditMode(guest.id)
      return
    }

    const updatedGuest = { ...guest, [field]: value }

    try {
      await updateItem("guests", updatedGuest)
      toggleEditMode(guest.id)
      // אין צורך לעדכן את הסטייט מקומית כי ה-listener יטפל בזה
    } catch (error) {
      console.error("שגיאה בעדכון אורח:", error)
      customToast.error("שגיאה בעדכון אורח", "אירעה שגיאה בעת עדכון פרטי האורח")
    }
  }

  // Calculate statistics
  const totalGuests = guests.reduce((sum, guest) => sum + guest.invitedCount, 0)
  const confirmedGuests = guests
    .filter((guest) => guest.confirmed === "כן")
    .reduce((sum, guest) => sum + guest.invitedCount, 0)
  const pendingGuests = guests
    .filter((guest) => guest.confirmed === "אולי")
    .reduce((sum, guest) => sum + guest.invitedCount, 0)
  const declinedGuests = guests
    .filter((guest) => guest.confirmed === "לא")
    .reduce((sum, guest) => sum + guest.invitedCount, 0)

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-none overflow-hidden">
        <div className="bg-gradient-to-r from-primary/90 to-pink-500/90 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">רשימת אורחים</CardTitle>
            <CardDescription className="text-white/80">ניהול רשימת המוזמנים שלך</CardDescription>
          </CardHeader>
        </div>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-secondary/30 border-none">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">סך הכל אורחים</p>
                <p className="text-3xl font-bold">{totalGuests}</p>
              </CardContent>
            </Card>
            <Card className="bg-success/10 border-none">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">אישרו הגעה</p>
                <p className="text-3xl font-bold text-success">{confirmedGuests}</p>
              </CardContent>
            </Card>
            <Card className="bg-warning/10 border-none">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">טרם אישרו</p>
                <p className="text-3xl font-bold text-warning">{pendingGuests}</p>
              </CardContent>
            </Card>
            <Card className="bg-destructive/10 border-none">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">לא מגיעים</p>
                <p className="text-3xl font-bold text-destructive">{declinedGuests}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
            <div className="relative w-full md:w-auto md:flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש אורחים..."
                className="pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    סינון
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterRelation("כל הקשרים")}>כל הקשרים</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRelation("משפחה")}>משפחה</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRelation("חברים")}>חברים</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRelation("עבודה")}>עבודה</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {!isSharedView && (
                <>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                    <Upload className="h-4 w-4 mr-1" />
                    ייבוא
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleImportExcel}
                    />
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleExportExcel}>
                    <Download className="h-4 w-4 mr-1" />
                    ייצוא
                  </Button>

                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-1" />
                        הוסף אורח
                      </Button>
                    </DialogTrigger>
                    {/* עדכון הרינדור של טופס הוספת אורח כדי להציג שגיאות */}
                    {/* עדכן את הדיאלוג של הוספת אורח */}
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>הוסף אורח חדש</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            שם מלא
                          </Label>
                          <Input
                            id="name"
                            value={newGuest.fullName || ""}
                            onChange={(e) => handleGuestFieldChange("fullName", e.target.value)}
                            className={`col-span-3 ${formErrors.fullName && formTouched.fullName ? "border-red-500" : ""}`}
                          />
                          {formErrors.fullName && formTouched.fullName && (
                            <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.fullName}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            טלפון
                          </Label>
                          <Input
                            id="phone"
                            value={newGuest.phoneNumber || ""}
                            onChange={(e) => handleGuestFieldChange("phoneNumber", e.target.value)}
                            className={`col-span-3 ${formErrors.phoneNumber && formTouched.phoneNumber ? "border-red-500" : ""}`}
                          />
                          {formErrors.phoneNumber && formTouched.phoneNumber && (
                            <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.phoneNumber}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="relation" className="text-right">
                            קשר
                          </Label>
                          <Select
                            value={newGuest.relation}
                            onValueChange={(value) => handleGuestFieldChange("relation", value)}
                            onOpenChange={() => setFormTouched({ ...formTouched, relation: true })}
                          >
                            <SelectTrigger
                              className={`col-span-3 ${formErrors.relation && formTouched.relation ? "border-red-500" : ""}`}
                            >
                              <SelectValue placeholder="בחר קשר" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="משפחה">משפחה</SelectItem>
                              <SelectItem value="חברים">חברים</SelectItem>
                              <SelectItem value="עבודה">עבודה</SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.relation && formTouched.relation && (
                            <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.relation}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="count" className="text-right">
                            כמות מוזמנים
                          </Label>
                          <Input
                            id="count"
                            type="number"
                            placeholder="הכנס מספר אורחים משוער"
                            value={newGuest.invitedCount || ""}
                            onChange={(e) => handleGuestFieldChange("invitedCount", Number.parseInt(e.target.value))}
                            className={`col-span-3 ${formErrors.invitedCount && formTouched.invitedCount ? "border-red-500" : ""}`}
                          />
                          {formErrors.invitedCount && formTouched.invitedCount && (
                            <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.invitedCount}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="confirmed" className="text-right">
                            אישור הגעה
                          </Label>
                          <Select
                            value={newGuest.confirmed}
                            onValueChange={(value) => handleGuestFieldChange("confirmed", value)}
                            onOpenChange={() => setFormTouched({ ...formTouched, confirmed: true })}
                          >
                            <SelectTrigger
                              className={`col-span-3 ${formErrors.confirmed && formTouched.confirmed ? "border-red-500" : ""}`}
                            >
                              <SelectValue placeholder="בחר סטטוס" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="כן">כן</SelectItem>
                              <SelectItem value="לא">לא</SelectItem>
                              <SelectItem value="אולי">אולי</SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.confirmed && formTouched.confirmed && (
                            <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.confirmed}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="notes" className="text-right">
                            הערות
                          </Label>
                          <Input
                            id="notes"
                            value={newGuest.specialNotes || ""}
                            onChange={(e) => handleGuestFieldChange("specialNotes", e.target.value)}
                            className="col-span-3"
                          />
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
                        <Button onClick={handleAddGuest}>הוסף אורח</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>

          {filterRelation && filterRelation !== "כל הקשרים" && (
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="gap-1">
                {filterRelation}
                <button
                  onClick={() => setFilterRelation(null)}
                  className="ml-1 rounded-full hover:bg-secondary/50 p-0.5"
                >
                  ✕
                </button>
              </Badge>
            </div>
          )}
        </CardContent>

        <Tabs defaultValue="table" className="px-6">
          <TabsList className="mb-4">
            <TabsTrigger value="table">טבלה</TabsTrigger>
            <TabsTrigger value="cards">כרטיסים</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>טלפון</TableHead>
                    <TableHead>קשר</TableHead>
                    <TableHead>כמות</TableHead>
                    <TableHead>אישור</TableHead>
                    <TableHead>הערות</TableHead>
                    {!isSharedView && <TableHead>פעולות</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuests.length > 0 ? (
                    filteredGuests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">
                          {editMode[guest.id] ? (
                            <Input
                              defaultValue={guest.fullName}
                              onBlur={(e) => handleInlineEdit(guest, "fullName", e.target.value)}
                            />
                          ) : (
                            guest.fullName
                          )}
                        </TableCell>
                        <TableCell>
                          {editMode[guest.id] ? (
                            <Input
                              defaultValue={guest.phoneNumber}
                              onBlur={(e) => handleInlineEdit(guest, "phoneNumber", e.target.value)}
                            />
                          ) : (
                            guest.phoneNumber
                          )}
                        </TableCell>
                        <TableCell>
                          {editMode[guest.id] ? (
                            <Select
                              defaultValue={guest.relation}
                              onValueChange={(value) => handleInlineEdit(guest, "relation", value as Guest["relation"])}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="משפחה">משפחה</SelectItem>
                                <SelectItem value="חברים">חברים</SelectItem>
                                <SelectItem value="עבודה">עבודה</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            guest.relation
                          )}
                        </TableCell>
                        <TableCell>
                          {editMode[guest.id] ? (
                            <Input
                              type="number"
                              defaultValue={guest.invitedCount}
                              onBlur={(e) => handleInlineEdit(guest, "invitedCount", Number(e.target.value))}
                            />
                          ) : (
                            guest.invitedCount
                          )}
                        </TableCell>
                        <TableCell>
                          {editMode[guest.id] ? (
                            <Select
                              defaultValue={guest.confirmed}
                              onValueChange={(value) =>
                                handleInlineEdit(guest, "confirmed", value as Guest["confirmed"])
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="כן">כן</SelectItem>
                                <SelectItem value="לא">לא</SelectItem>
                                <SelectItem value="אולי">אולי</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant={
                                guest.confirmed === "כן"
                                  ? "success"
                                  : guest.confirmed === "אולי"
                                    ? "warning"
                                    : "outline"
                              }
                            >
                              {guest.confirmed}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {editMode[guest.id] ? (
                            <Input
                              defaultValue={guest.specialNotes}
                              onBlur={(e) => handleInlineEdit(guest, "specialNotes", e.target.value)}
                            />
                          ) : (
                            guest.specialNotes
                          )}
                        </TableCell>
                        {!isSharedView && (
                          <TableCell>
                            <div className="flex gap-1">
                              {editMode[guest.id] ? (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => toggleEditMode(guest.id)}>
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => toggleEditMode(guest.id)}>
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => toggleEditMode(guest.id)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGuest(guest.id)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isSharedView ? 6 : 7} className="text-center py-6 text-muted-foreground">
                        לא נמצאו אורחים
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="cards">
            {filteredGuests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                {filteredGuests.map((guest) => (
                  <Card key={guest.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{guest.fullName}</h3>
                          <p className="text-sm text-muted-foreground">{guest.relation}</p>
                        </div>
                        <Badge
                          variant={
                            guest.confirmed === "כן" ? "success" : guest.confirmed === "אולי" ? "warning" : "outline"
                          }
                        >
                          {guest.confirmed}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">טלפון:</span>
                          <span>{guest.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">כמות מוזמנים:</span>
                          <span>{guest.invitedCount}</span>
                        </div>
                        {guest.specialNotes && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium">הערות:</span>
                            <span className="text-muted-foreground">{guest.specialNotes}</span>
                          </div>
                        )}
                      </div>
                      {!isSharedView && (
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => handleEditGuest(guest)}>
                            <Edit className="h-3 w-3 mr-1" />
                            ערוך
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteGuest(guest.id)}>
                            <Trash className="h-3 w-3 mr-1" />
                            הסר
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>לא נמצאו אורחים</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            סה"כ: {filteredGuests.length} אורחים ({filteredGuests.reduce((sum, guest) => sum + guest.invitedCount, 0)}{" "}
            מוזמנים)
          </div>
          {guests.length > 0 && !isSharedView && (
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-1" />
              ייצוא לאקסל
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>ערוך פרטי אורח</DialogTitle>
          </DialogHeader>
          {editingGuest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  שם מלא
                </Label>
                <Input
                  id="edit-name"
                  value={editingGuest.fullName}
                  onChange={(e) => setEditingGuest({ ...editingGuest, fullName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  טלפון
                </Label>
                <Input
                  id="edit-phone"
                  value={editingGuest.phoneNumber}
                  onChange={(e) => setEditingGuest({ ...editingGuest, phoneNumber: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-relation" className="text-right">
                  קשר
                </Label>
                <Select
                  value={editingGuest.relation}
                  onValueChange={(value) => setEditingGuest({ ...editingGuest, relation: value as Guest["relation"] })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="בחר קשר" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="משפחה">משפחה</SelectItem>
                    <SelectItem value="חברים">חברים</SelectItem>
                    <SelectItem value="עבודה">עבודה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-count" className="text-right">
                  כמות מוזמנים
                </Label>
                <Input
                  id="edit-count"
                  type="number"
                  value={editingGuest.invitedCount}
                  onChange={(e) => setEditingGuest({ ...editingGuest, invitedCount: Number.parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-confirmed" className="text-right">
                  אישור הגעה
                </Label>
                <Select
                  value={editingGuest.confirmed}
                  onValueChange={(value) =>
                    setEditingGuest({ ...editingGuest, confirmed: value as Guest["confirmed"] })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="כן">כן</SelectItem>
                    <SelectItem value="לא">לא</SelectItem>
                    <SelectItem value="אולי">אולי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  הערות
                </Label>
                <Input
                  id="edit-notes"
                  value={editingGuest.specialNotes}
                  onChange={(e) => setEditingGuest({ ...editingGuest, specialNotes: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleUpdateGuest}>עדכן פרטי אורח</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

