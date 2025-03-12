"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "@/lib/types"
import { PlusCircle, Edit, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

export function TaskManager() {
  const { toast } = useToast()
  const { user, demoMode, weddingData, addItem, updateItem, deleteItem } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", category: "" })

  // הוספת ולידציה לטופס הוספת משימה

  // הוסף את המשתנים הבאים בתוך הקומפוננטה, אחרי הגדרת המשתנים הקיימים
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (weddingData?.tasks) {
      setTasks(weddingData.tasks)
    }
  }, [weddingData])

  // הוסף פונקציית ולידציה לטופס הוספת משימה
  const validateTaskForm = (task: { title: string; description: string; dueDate: string; category: string }): Record<
    string,
    string
  > => {
    const errors: Record<string, string> = {}

    if (!task.title || task.title.trim() === "") {
      errors.title = "כותרת המשימה היא שדה חובה"
    }

    if (!task.dueDate) {
      errors.dueDate = "תאריך יעד הוא שדה חובה"
    }

    return errors
  }

  // הוסף פונקציה לטיפול בשינוי שדה ועדכון מצב "נגעו בשדה"
  const handleTaskFieldChange = (field: string, value: any) => {
    setNewTask({ ...newTask, [field]: value })
    setFormTouched({ ...formTouched, [field]: true })

    // בדוק ולידציה לשדה זה אם כבר נגעו בו
    if (formTouched[field]) {
      const fieldError = validateTaskField(field, value)
      setFormErrors({ ...formErrors, [field]: fieldError })
    }
  }

  // הוסף פונקציית ולידציה לשדה בודד
  const validateTaskField = (field: string, value: any): string => {
    switch (field) {
      case "title":
        return !value || value.trim() === "" ? "כותרת המשימה היא שדה חובה" : ""
      case "dueDate":
        return !value ? "תאריך יעד הוא שדה חובה" : ""
      default:
        return ""
    }
  }

  // עדכון פונקציית addTask
  const addTask = async () => {
    // בדוק ולידציה
    const errors = validateTaskForm(newTask)
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

    if (newTask.title) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        completed: false,
      }

      try {
        await addItem("tasks", task)
        setNewTask({ title: "", description: "", dueDate: "", category: "" })
        // נקה שגיאות וסימוני נגיעה
        setFormErrors({})
        setFormTouched({})
        toast({
          title: "משימה נוספה",
          description: `המשימה "${task.title}" נוספה בהצלחה`,
        })
      } catch (error) {
        console.error("שגיאה בהוספת משימה:", error)
        toast({
          title: "שגיאה בהוספת משימה",
          description: "אירעה שגיאה בעת הוספת המשימה",
          variant: "destructive",
        })
      }
    }
  }

  const toggleTaskCompletion = async (id: string) => {
    const taskToUpdate = tasks.find((task) => task.id === id)
    if (!taskToUpdate) return

    const newStatus = !taskToUpdate.completed
    const updatedTask = { ...taskToUpdate, completed: newStatus }

    try {
      await updateItem("tasks", updatedTask)
      toast({
        title: newStatus ? "משימה הושלמה" : "משימה לא הושלמה",
        description: `המשימה "${taskToUpdate.title}" ${newStatus ? "סומנה כהושלמה" : "סומנה כלא הושלמה"}`,
      })
    } catch (error) {
      console.error("שגיאה בעדכון משימה:", error)
      toast({
        title: "שגיאה בעדכון משימה",
        description: "אירעה שגיאה בעת עדכון סטטוס המשימה",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (id: string) => {
    const taskName = tasks.find((t) => t.id === id)?.title

    try {
      await deleteItem("tasks", id)
      toast({
        title: "משימה נמחקה",
        description: `המשימה "${taskName}" נמחקה בהצלחה`,
      })
    } catch (error) {
      console.error("שגיאה במחיקת משימה:", error)
      toast({
        title: "שגיאה במחיקת משימה",
        description: "אירעה שגיאה בעת מחיקת המשימה",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ניהול משימות</CardTitle>
          <CardDescription>עקוב אחר המשימות לקראת החתונה</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* עדכון הרינדור של טופס הוספת משימה כדי להציג שגיאות */}
            {/* עדכן את טופס הוספת משימה */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="כותרת המשימה"
                  value={newTask.title}
                  onChange={(e) => handleTaskFieldChange("title", e.target.value)}
                  className={formErrors.title && formTouched.title ? "border-red-500" : ""}
                />
                {formErrors.title && formTouched.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  placeholder="תיאור"
                  value={newTask.description}
                  onChange={(e) => handleTaskFieldChange("description", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => handleTaskFieldChange("dueDate", e.target.value)}
                  className={formErrors.dueDate && formTouched.dueDate ? "border-red-500" : ""}
                />
                {formErrors.dueDate && formTouched.dueDate && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  placeholder="קטגוריה"
                  value={newTask.category}
                  onChange={(e) => handleTaskFieldChange("category", e.target.value)}
                />
              </div>
              <Button onClick={addTask}>
                <PlusCircle className="ml-2 h-4 w-4" />
                הוסף משימה
              </Button>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTaskCompletion(task.id)} />
                    <span className={task.completed ? "line-through" : ""}>
                      {task.title} - {task.description} ({task.dueDate}) [{task.category}]
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>אין משימות להצגה</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

