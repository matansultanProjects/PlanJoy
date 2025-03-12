"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash, Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCustomToast } from "@/components/ui/custom-toast"
import { useAuth } from "@/components/auth-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface BudgetItem {
  id: string
  category: string
  description: string
  planned: number
  deposit: number
  actual: number | null
}

interface BudgetProps {
  isSharedView?: boolean
}

export function Budget({ isSharedView = false }: BudgetProps) {
  const customToast = useCustomToast()
  const { weddingData, addItem, updateItem, deleteItem } = useAuth()
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({})
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})

  // הוסף את המשתנים הבאים בתוך הקומפוננטה, אחרי הגדרת המשתנים הקיימים
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (weddingData?.budgetItems) {
      setBudgetItems(weddingData.budgetItems)
    }
  }, [weddingData])

  // הוסף פונקציית ולידציה לטופס הוספת פריט תקציב
  const validateBudgetForm = (item: Partial<BudgetItem>): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!item.category || item.category.trim() === "") {
      errors.category = "קטגוריה היא שדה חובה"
    }

    if (!item.description || item.description.trim() === "") {
      errors.description = "תיאור הוא שדה חובה"
    }

    if (!item.planned || item.planned <= 0) {
      errors.planned = "יש להזין סכום מתוכנן חיובי"
    }

    if (item.deposit && item.deposit < 0) {
      errors.deposit = "מקדמה לא יכולה להיות שלילית"
    }

    return errors
  }

  // הוסף פונקציה לטיפול בשינוי שדה ועדכון מצב "נגעו בשדה"
  const handleBudgetFieldChange = (field: string, value: any) => {
    setNewItem({ ...newItem, [field]: value })
    setFormTouched({ ...formTouched, [field]: true })

    // בדוק ולידציה לשדה זה אם כבר נגעו בו
    if (formTouched[field]) {
      const fieldError = validateBudgetField(field, value)
      setFormErrors({ ...formErrors, [field]: fieldError })
    }
  }

  // הוסף פונקציית ולידציה לשדה בודד
  const validateBudgetField = (field: string, value: any): string => {
    switch (field) {
      case "category":
        return !value || value.trim() === "" ? "קטגוריה היא שדה חובה" : ""
      case "description":
        return !value || value.trim() === "" ? "תיאור הוא שדה חובה" : ""
      case "planned":
        if (!value) return "יש להזין סכום מתוכנן"
        if (Number(value) <= 0) return "יש להזין סכום חיובי"
        return ""
      case "deposit":
        return value && Number(value) < 0 ? "מקדמה לא יכולה להיות שלילית" : ""
      default:
        return ""
    }
  }

  // עדכון פונקציית handleAddItem
  const handleAddItem = async () => {
    if (isSharedView) return

    // בדוק ולידציה
    const errors = validateBudgetForm(newItem)
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

    if (newItem.category && newItem.description && newItem.planned) {
      const itemToAdd: BudgetItem = {
        id: Date.now().toString(),
        category: newItem.category,
        description: newItem.description,
        planned: Number(newItem.planned),
        deposit: Number(newItem.deposit) || 0,
        actual: null,
      }

      try {
        await addItem("budgetItems", itemToAdd)
        setNewItem({})
        setIsAddDialogOpen(false)
        // נקה שגיאות וסימוני נגיעה
        setFormErrors({})
        setFormTouched({})
        customToast.success("פריט תקציב נוסף", `הפריט "${itemToAdd.description}" נוסף בהצלחה`)
      } catch (error) {
        console.error("שגיאה בהוספת פריט תקציב:", error)
        customToast.error("שגיאה בהוספת פריט", "אירעה שגיאה בעת הוספת פריט תקציב")
      }
    }
  }

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const handleUpdateItem = async () => {
    if (isSharedView || !editingItem) return

    try {
      await updateItem("budgetItems", editingItem)
      setEditingItem(null)
      setIsEditDialogOpen(false)
      customToast.success("פריט תקציב עודכן", `הפריט "${editingItem.description}" עודכן בהצלחה`)
    } catch (error) {
      console.error("שגיאה בעדכון פריט תקציב:", error)
      customToast.error("שגיאה בעדכון פריט", "אירעה שגיאה בעת עדכון פריט תקציב")
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (isSharedView) return

    const item = budgetItems.find((item) => item.id === id)
    if (!item) return

    try {
      await deleteItem("budgetItems", id)
      customToast.success("פריט תקציב נמחק", `הפריט "${item.description}" נמחק בהצלחה`)
    } catch (error) {
      console.error("שגיאה במחיקת פריט תקציב:", error)
      customToast.error("שגיאה במחיקת פריט", "אירעה שגיאה בעת מחיקת פריט תקציב")
    }
  }

  const toggleEditMode = (id: string) => {
    setEditMode((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleInlineEdit = async (item: BudgetItem, field: keyof BudgetItem, value: any) => {
    if (isSharedView) return

    // בדיקה אם הערך השתנה בכלל
    if (item[field] === value) {
      toggleEditMode(item.id)
      return
    }

    const updatedItem = { ...item, [field]: value }

    try {
      await updateItem("budgetItems", updatedItem)
      toggleEditMode(item.id)
      // אין צורך לעדכן את הסטייט מקומית כי ה-listener יטפל בזה
    } catch (error) {
      console.error("שגיאה בעדכון פריט:", error)
      customToast.error("שגיאה בעדכון פריט", "אירעה שגיאה בעת עדכון הפריט")
    }
  }

  const totalPlanned = budgetItems.reduce((sum, item) => sum + item.planned, 0)
  const totalDeposit = budgetItems.reduce((sum, item) => sum + item.deposit, 0)
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.actual || 0), 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>תקציב החתונה</CardTitle>
              <CardDescription>מעקב אחר הוצאות והתקדמות</CardDescription>
            </div>
            {!isSharedView && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    הוסף הוצאה
                  </Button>
                </DialogTrigger>
                {/* עדכן את הדיאלוג של הוספת פריט תקציב */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוסף הוצאה חדשה</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        קטגוריה
                      </Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => handleBudgetFieldChange("category", value)}
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
                          <SelectItem value="שמלת כלה">שמלת כלה</SelectItem>
                          <SelectItem value="צלם">צלם</SelectItem>
                          <SelectItem value="מוזיקה">מוזיקה</SelectItem>
                          <SelectItem value="אחר">אחר</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.category && formTouched.category && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.category}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        תיאור
                      </Label>
                      <Input
                        id="description"
                        value={newItem.description || ""}
                        onChange={(e) => handleBudgetFieldChange("description", e.target.value)}
                        className={`col-span-3 ${formErrors.description && formTouched.description ? "border-red-500" : ""}`}
                      />
                      {formErrors.description && formTouched.description && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.description}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="planned" className="text-right">
                        סכום מתוכנן
                      </Label>
                      <Input
                        id="planned"
                        type="number"
                        value={newItem.planned || ""}
                        onChange={(e) => handleBudgetFieldChange("planned", Number(e.target.value))}
                        className={`col-span-3 ${formErrors.planned && formTouched.planned ? "border-red-500" : ""}`}
                      />
                      {formErrors.planned && formTouched.planned && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.planned}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="deposit" className="text-right">
                        מקדמה
                      </Label>
                      <Input
                        id="deposit"
                        type="number"
                        value={newItem.deposit || ""}
                        onChange={(e) => handleBudgetFieldChange("deposit", Number(e.target.value))}
                        className={`col-span-3 ${formErrors.deposit && formTouched.deposit ? "border-red-500" : ""}`}
                      />
                      {formErrors.deposit && formTouched.deposit && (
                        <p className="text-red-500 text-sm col-span-3 col-start-2">{formErrors.deposit}</p>
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
                    <Button onClick={handleAddItem}>הוסף הוצאה</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="grid gap-0.5">
                  <div className="text-sm font-medium">סך הכל תקציב</div>
                  <div className="text-2xl font-bold">₪{totalPlanned.toLocaleString()}</div>
                </div>
                <div className="grid gap-0.5 text-left">
                  <div className="text-sm font-medium">סך הכל מקדמות</div>
                  <div className="text-2xl font-bold text-pink-500">₪{totalDeposit.toLocaleString()}</div>
                </div>
              </div>
              <Progress value={(totalDeposit / totalPlanned) * 100 || 0} className="h-3" />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>קטגוריה</TableHead>
                  <TableHead>תיאור</TableHead>
                  <TableHead>סכום מתוכנן</TableHead>
                  <TableHead>מקדמה</TableHead>
                  <TableHead>סכום סופי</TableHead>
                  {!isSharedView && <TableHead>פעולות</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.length > 0 ? (
                  budgetItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {editMode[item.id] ? (
                          <Select
                            defaultValue={item.category}
                            onValueChange={(value) => handleInlineEdit(item, "category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="אולם">אולם</SelectItem>
                              <SelectItem value="קייטרינג">קייטרינג</SelectItem>
                              <SelectItem value="שמלת כלה">שמלת כלה</SelectItem>
                              <SelectItem value="צלם">צלם</SelectItem>
                              <SelectItem value="מוזיקה">מוזיקה</SelectItem>
                              <SelectItem value="אחר">אחר</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          item.category
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode[item.id] ? (
                          <Input
                            defaultValue={item.description}
                            onBlur={(e) => handleInlineEdit(item, "description", e.target.value)}
                          />
                        ) : (
                          item.description
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode[item.id] ? (
                          <Input
                            type="number"
                            defaultValue={item.planned}
                            onBlur={(e) => handleInlineEdit(item, "planned", Number(e.target.value))}
                          />
                        ) : (
                          `₪${item.planned.toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode[item.id] ? (
                          <Input
                            type="number"
                            defaultValue={item.deposit}
                            onBlur={(e) => handleInlineEdit(item, "deposit", Number(e.target.value))}
                          />
                        ) : (
                          `₪${item.deposit.toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode[item.id] ? (
                          <Input
                            type="number"
                            defaultValue={item.actual || 0}
                            onBlur={(e) => handleInlineEdit(item, "actual", Number(e.target.value))}
                          />
                        ) : (
                          `₪${(item.actual || 0).toLocaleString()}`
                        )}
                      </TableCell>
                      {!isSharedView && (
                        <TableCell>
                          <div className="flex gap-1">
                            {editMode[item.id] ? (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => toggleEditMode(item.id)}>
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => toggleEditMode(item.id)}>
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => toggleEditMode(item.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
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
                    <TableCell colSpan={isSharedView ? 5 : 6} className="text-center py-6 text-muted-foreground">
                      לא נמצאו פריטי תקציב
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ערוך פריט תקציב</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  קטגוריה
                </Label>
                <Select
                  value={editingItem.category}
                  onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="אולם">אולם</SelectItem>
                    <SelectItem value="קייטרינג">קייטרינג</SelectItem>
                    <SelectItem value="שמלת כלה">שמלת כלה</SelectItem>
                    <SelectItem value="צלם">צלם</SelectItem>
                    <SelectItem value="מוזיקה">מוזיקה</SelectItem>
                    <SelectItem value="אחר">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  תיאור
                </Label>
                <Input
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-planned" className="text-right">
                  סכום מתוכנן
                </Label>
                <Input
                  id="edit-planned"
                  type="number"
                  value={editingItem.planned}
                  onChange={(e) => setEditingItem({ ...editingItem, planned: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-deposit" className="text-right">
                  מקדמה
                </Label>
                <Input
                  id="edit-deposit"
                  type="number"
                  value={editingItem.deposit}
                  onChange={(e) => setEditingItem({ ...editingItem, deposit: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-actual" className="text-right">
                  סכום סופי
                </Label>
                <Input
                  id="edit-actual"
                  type="number"
                  value={editingItem.actual || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, actual: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleUpdateItem}>עדכן פריט</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

