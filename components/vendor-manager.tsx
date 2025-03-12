"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { PlusCircle, Phone, Mail, DollarSign, Briefcase, User, Edit, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

interface Vendor {
  id: string
  name: string
  category: string
  contact: string
  phone: string
  email: string
  cost: number
  status: "מאושר" | "בתהליך" | "לא מאושר"
}

export function VendorManager({ isSharedView = false }) {
  const { user, demoMode, weddingData, addItem, updateItem, deleteItem } = useAuth()
  const { toast } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({})
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // הוספת ולידציה לטופס הוספת ספק

  // הוסף את המשתנים הבאים בתוך הקומפוננטה, אחרי הגדרת המשתנים הקיימים
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({})

  // הוסף פונקציית ולידציה לטופס הוספת ספק
  const validateVendorForm = (vendor: Partial<Vendor>): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!vendor.name || vendor.name.trim() === "") {
      errors.name = "שם הספק הוא שדה חובה"
    }

    if (!vendor.category || vendor.category.trim() === "") {
      errors.category = "קטגוריה היא שדה חובה"
    }

    if (!vendor.contact || vendor.contact.trim() === "") {
      errors.contact = "איש קשר הוא שדה חובה"
    }

    if (vendor.phone && !/^[0-9\-+\s()]*$/.test(vendor.phone)) {
      errors.phone = "מספר טלפון לא תקין"
    }

    if (vendor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendor.email)) {
      errors.email = "כתובת אימייל לא תקינה"
    }

    if (vendor.cost && vendor.cost < 0) {
      errors.cost = "עלות לא יכולה להיות שלילית"
    }

    return errors
  }

  // הוסף פונקציה לטיפול בשינוי שדה ועדכון מצב "נגעו בשדה"
  const handleVendorFieldChange = (field: string, value: any) => {
    setNewVendor({ ...newVendor, [field]: value })
    setFormTouched({ ...formTouched, [field]: true })

    // בדוק ולידציה לשדה זה אם כבר נגעו בו
    if (formTouched[field]) {
      const fieldError = validateVendorField(field, value)
      setFormErrors({ ...formErrors, [field]: fieldError })
    }
  }

  // הוסף פונקציית ולידציה לשדה בודד
  const validateVendorField = (field: string, value: any): string => {
    switch (field) {
      case "name":
        return !value || value.trim() === "" ? "שם הספק הוא שדה חובה" : ""
      case "category":
        return !value || value.trim() === "" ? "קטגוריה היא שדה חובה" : ""
      case "contact":
        return !value || value.trim() === "" ? "איש קשר הוא שדה חובה" : ""
      case "phone":
        return value && !/^[0-9\-+\s()]*$/.test(value) ? "מספר טלפון לא תקין" : ""
      case "email":
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "כתובת אימייל לא תקינה" : ""
      case "cost":
        return value && Number(value) < 0 ? "עלות לא יכולה להיות שלילית" : ""
      default:
        return ""
    }
  }

  useEffect(() => {
    if (weddingData?.vendors) {
      setVendors(weddingData.vendors)
    }
  }, [weddingData])

  // עדכון פונקציית handleAddVendor
  const handleAddVendor = async () => {
    if (isSharedView) return

    // בדוק ולידציה
    const errors = validateVendorForm(newVendor)
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

    if (newVendor.name && newVendor.category && newVendor.contact) {
      const vendorToAdd: Vendor = {
        id: Date.now().toString(),
        name: newVendor.name,
        category: newVendor.category,
        contact: newVendor.contact,
        phone: newVendor.phone || "",
        email: newVendor.email || "",
        cost: newVendor.cost || 0,
        status: "בתהליך",
      }

      try {
        await addItem("vendors", vendorToAdd)
        setNewVendor({})
        setIsAddDialogOpen(false)
        // נקה שגיאות וסימוני נגיעה
        setFormErrors({})
        setFormTouched({})
        toast({
          title: "ספק נוסף",
          description: `${vendorToAdd.name} נוסף בהצלחה לרשימת הספקים`,
        })
      } catch (error) {
        console.error("שגיאה בהוספת ספק:", error)
        toast({
          title: "שגיאה בהוספת ספק",
          description: "אירעה שגיאה בעת הוספת הספק",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditVendor = async () => {
    if (isSharedView || !editingVendor) return

    try {
      await updateItem("vendors", editingVendor)
      setEditingVendor(null)
      setIsEditDialogOpen(false)
      toast({
        title: "ספק עודכן",
        description: `פרטי הספק ${editingVendor.name} עודכנו בהצלחה`,
      })
    } catch (error) {
      console.error("שגיאה בעדכון ספק:", error)
      toast({
        title: "שגיאה בעדכון ספק",
        description: "אירעה שגיאה בעת עדכון פרטי הספק",
        variant: "destructive",
      })
    }
  }

  const handleDeleteVendor = async (id: string) => {
    if (isSharedView) return

    const vendorName = vendors.find((v) => v.id === id)?.name

    try {
      await deleteItem("vendors", id)
      toast({
        title: "ספק הוסר",
        description: `${vendorName} הוסר מרשימת הספקים`,
      })
    } catch (error) {
      console.error("שגיאה במחיקת ספק:", error)
      toast({
        title: "שגיאה במחיקת ספק",
        description: "אירעה שגיאה בעת מחיקת הספק",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <Briefcase className="inline-block mr-2" />
                ספקים
              </CardTitle>
              <CardDescription>ניהול ספקי החתונה</CardDescription>
            </div>
            {!isSharedView && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    הוסף ספק
                  </Button>
                </DialogTrigger>
                {/* עדכון הרינדור של טופס הוספת ספק כדי להציג שגיאות
                עדכן את הדיאלוג של הוספת ספק */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוסף ספק חדש</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        שם
                      </Label>
                      <Input
                        id="name"
                        value={newVendor.name || ""}
                        onChange={(e) => handleVendorFieldChange("name", e.target.value)}
                        className={`col-span-3 ${formErrors.name && formTouched.name ? "border-red-500" : ""}`}
                      />
                      {formErrors.name && formTouched.name && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.name}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        קטגוריה
                      </Label>
                      <Select
                        value={newVendor.category}
                        onValueChange={(value) => handleVendorFieldChange("category", value)}
                        onOpenChange={() => setFormTouched({ ...formTouched, category: true })}
                      >
                        <SelectTrigger
                          className={`col-span-3 ${formErrors.category && formTouched.category ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="בחר קטגוריה" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="אולם">אולם</SelectItem>
                          <SelectItem value="קייטרינג">קייטרינג</SelectItem>
                          <SelectItem value="צלם">צלם</SelectItem>
                          <SelectItem value="מוזיקה">מוזיקה</SelectItem>
                          <SelectItem value="עיצוב">עיצוב</SelectItem>
                          <SelectItem value="אחר">אחר</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.category && formTouched.category && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.category}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contact" className="text-right">
                        איש קשר
                      </Label>
                      <Input
                        id="contact"
                        value={newVendor.contact || ""}
                        onChange={(e) => handleVendorFieldChange("contact", e.target.value)}
                        className={`col-span-3 ${formErrors.contact && formTouched.contact ? "border-red-500" : ""}`}
                      />
                      {formErrors.contact && formTouched.contact && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.contact}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        טלפון
                      </Label>
                      <Input
                        id="phone"
                        value={newVendor.phone || ""}
                        onChange={(e) => handleVendorFieldChange("phone", e.target.value)}
                        className={`col-span-3 ${formErrors.phone && formTouched.phone ? "border-red-500" : ""}`}
                      />
                      {formErrors.phone && formTouched.phone && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.phone}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        אימייל
                      </Label>
                      <Input
                        id="email"
                        value={newVendor.email || ""}
                        onChange={(e) => handleVendorFieldChange("email", e.target.value)}
                        className={`col-span-3 ${formErrors.email && formTouched.email ? "border-red-500" : ""}`}
                      />
                      {formErrors.email && formTouched.email && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.email}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cost" className="text-right">
                        עלות
                      </Label>
                      <Input
                        id="cost"
                        type="number"
                        value={newVendor.cost || ""}
                        onChange={(e) => handleVendorFieldChange("cost", Number(e.target.value))}
                        className={`col-span-3 ${formErrors.cost && formTouched.cost ? "border-red-500" : ""}`}
                      />
                      {formErrors.cost && formTouched.cost && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.cost}</p>
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
                    <Button onClick={handleAddVendor}>הוסף ספק</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {vendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{vendor.name}</h3>
                        <p className="text-sm text-muted-foreground">{vendor.category}</p>
                      </div>
                      <Badge variant={vendor.status === "מאושר" ? "success" : "secondary"}>{vendor.status}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">איש קשר:</span>
                        {vendor.contact}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {vendor.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {vendor.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">עלות:</span>₪{vendor.cost.toLocaleString()}
                      </div>
                    </div>
                    {!isSharedView && (
                      <div className="flex justify-end gap-2">
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => setEditingVendor(vendor)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>ערוך ספק</DialogTitle>
                            </DialogHeader>
                            {editingVendor && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-name" className="text-right">
                                    שם
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    value={editingVendor.name}
                                    onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-category" className="text-right">
                                    קטגוריה
                                  </Label>
                                  <Select
                                    value={editingVendor.category}
                                    onValueChange={(value) => setEditingVendor({ ...editingVendor, category: value })}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="בחר קטגוריה" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="אולם">אולם</SelectItem>
                                      <SelectItem value="קייטרינג">קייטרינג</SelectItem>
                                      <SelectItem value="צלם">צלם</SelectItem>
                                      <SelectItem value="מוזיקה">מוזיקה</SelectItem>
                                      <SelectItem value="עיצוב">עיצוב</SelectItem>
                                      <SelectItem value="אחר">אחר</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-contact" className="text-right">
                                    איש קשר
                                  </Label>
                                  <Input
                                    id="edit-contact"
                                    value={editingVendor.contact}
                                    onChange={(e) => setEditingVendor({ ...editingVendor, contact: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-phone" className="text-right">
                                    טלפון
                                  </Label>
                                  <Input
                                    id="edit-phone"
                                    value={editingVendor.phone}
                                    onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-email" className="text-right">
                                    אימייל
                                  </Label>
                                  <Input
                                    id="edit-email"
                                    value={editingVendor.email}
                                    onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-cost" className="text-right">
                                    עלות
                                  </Label>
                                  <Input
                                    id="edit-cost"
                                    type="number"
                                    value={editingVendor.cost}
                                    onChange={(e) =>
                                      setEditingVendor({ ...editingVendor, cost: Number(e.target.value) })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-status" className="text-right">
                                    סטטוס
                                  </Label>
                                  <Select
                                    value={editingVendor.status}
                                    onValueChange={(value) =>
                                      setEditingVendor({ ...editingVendor, status: value as Vendor["status"] })
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="בחר סטטוס" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="מאושר">מאושר</SelectItem>
                                      <SelectItem value="בתהליך">בתהליך</SelectItem>
                                      <SelectItem value="לא מאושר">לא מאושר</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                ביטול
                              </Button>
                              <Button onClick={handleEditVendor}>שמור שינויים</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteVendor(vendor.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {vendors.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <p>אין ספקים להצגה</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

