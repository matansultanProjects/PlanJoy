"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import type { Guest } from "@/lib/types"
import { Plus, Minus, Users, Trash, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-provider"
import { useCustomToast } from "./ui/custom-toast"
import { useTranslation } from "@/hooks/useTranslation"

interface Table {
  id: string
  name: string
  seats: number
  guests: string[] // Guest IDs
}

interface GuestItemProps {
  guest: Guest
  onRemove: () => void
  showRemoveButton?: boolean
}

interface SeatingArrangementProps {
  isSharedView?: boolean
}

const GuestItem = ({ guest, onRemove, showRemoveButton = true }: GuestItemProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: "GUEST",
    item: { id: guest.id, invitedCount: guest.invitedCount },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex justify-between items-center p-2 rounded-md bg-secondary/50",
        isDragging ? "opacity-50" : "opacity-100",
      )}
    >
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <div>
          <span className="font-medium">{guest.fullName}</span>
          <Badge variant="secondary" className="ml-2">
            {guest.invitedCount} אורחים
          </Badge>
        </div>
      </div>
      {showRemoveButton && (
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      )}
    </motion.div>
  )
}

const TableComponent = ({ table, guests, onRemoveGuest, onAddGuest, onRemoveTable, isSharedView }) => {
  const { t } = useTranslation()

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: "GUEST",
    drop: (item: { id: string; invitedCount: number }) => onAddGuest(item.id, table.id),
    canDrop: (item: { id: string; invitedCount: number }) => {
      const currentOccupancy = table.guests.reduce((sum, guestId) => {
        const guest = guests.find((g) => g.id === guestId)
        return sum + (guest?.invitedCount || 0)
      }, 0)
      return currentOccupancy + item.invitedCount <= table.seats
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const tableGuests = table.guests.map((guestId) => guests.find((g) => g.id === guestId)).filter(Boolean)
  const currentOccupancy = tableGuests.reduce((sum, guest) => sum + (guest?.invitedCount || 0), 0)
  const occupancyPercentage = (currentOccupancy / table.seats) * 100

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        ref={drop}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          isOver && canDrop && "ring-2 ring-primary shadow-lg",
          isOver && !canDrop && "ring-2 ring-destructive",
          !isOver && "hover:shadow-md",
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{table.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={occupancyPercentage >= 100 ? "destructive" : "secondary"}>
                {currentOccupancy}/{table.seats} {t("seats")}
              </Badge>
              {!isSharedView && (
                <Button variant="ghost" size="icon" onClick={() => onRemoveTable(table.id)}>
                  <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            {tableGuests.length === 0 ? t("noAssignedGuests") : `${tableGuests.length} ${t("guestGroups")}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tableGuests.map(
              (guest) =>
                guest && (
                  <GuestItem
                    key={guest.id}
                    guest={guest}
                    onRemove={() => onRemoveGuest(guest.id, table.id)}
                    showRemoveButton={!isSharedView}
                  />
                ),
            )}
          </div>
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                occupancyPercentage >= 100 ? "bg-destructive" : "bg-primary",
              )}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const UnassignedGuests = ({ guests, onAddGuest }) => {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: "GUEST",
    drop: (item: { id: string }) => onAddGuest(item.id, null),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const { t } = useTranslation()

  return (
    <Card ref={drop} className={cn("mt-6 transition-all duration-300", isOver && "ring-2 ring-primary shadow-lg")}>
      <CardHeader>
        <CardTitle className="text-lg">{t("unassignedGuests")}</CardTitle>
        <CardDescription>
          {guests.length} {t("guestGroups")} ({guests.reduce((sum, guest) => sum + guest.invitedCount, 0)} {t("total")})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {guests.map((guest) => (
            <GuestItem key={guest.id} guest={guest} onRemove={() => {}} showRemoveButton={false} />
          ))}

          {guests.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">{t("noUnassignedGuests")}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SeatingArrangement({ isSharedView = false }: SeatingArrangementProps) {
  const { user, demoMode, weddingData, updateWeddingData } = useAuth()
  const { t } = useTranslation()
  const customToast = useCustomToast()
  const [guests, setGuests] = useState<Guest[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [newTableName, setNewTableName] = useState("")
  const [newTableSeats, setNewTableSeats] = useState(8)
  const [dataUpdated, setDataUpdated] = useState(false)

  // הוספת ולידציה לטופס הוספת שולחן

  // הוסף את המשתנים הבאים בתוך הקומפוננטה, אחרי הגדרת המשתנים הקיימים
  const [tableErrors, setTableErrors] = useState<Record<string, string>>({})
  const [tableTouched, setTableTouched] = useState<Record<string, boolean>>({})

  // הוסף פונקציית ולידציה לטופס הוספת שולחן
  const validateTableForm = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!newTableName || newTableName.trim() === "") {
      errors.tableName = "שם השולחן הוא שדה חובה"
    }

    if (!newTableSeats || newTableSeats <= 0) {
      errors.tableSeats = "מספר המקומות חייב להיות חיובי"
    }

    return errors
  }

  // עדכון פונקציית addTable
  const addTable = () => {
    if (isSharedView || demoMode) return

    // בדוק ולידציה
    const errors = validateTableForm()
    if (Object.keys(errors).length > 0) {
      setTableErrors(errors)
      // סמן את כל השדות כ"נגעו בהם"
      setTableTouched({ tableName: true, tableSeats: true })
      return
    }

    if (newTableName) {
      const newTable: Table = {
        id: Date.now().toString(),
        name: newTableName,
        seats: newTableSeats,
        guests: [],
      }
      const updatedTables = [...tables, newTable]
      setTables(updatedTables)
      //saveToLocalStorage({ tables: updatedTables })
      setNewTableName("")
      setNewTableSeats(8)
      // נקה שגיאות וסימוני נגיעה
      setTableErrors({})
      setTableTouched({})
      toast({
        title: t("tableAdded"),
        description: t("tableAddedDescription", { name: newTableName }),
      })
    }
  }

  useEffect(() => {
    if (weddingData?.guests) {
      setGuests(weddingData.guests)
    }
    if (weddingData?.tables) {
      setTables(weddingData.tables)
    }
  }, [weddingData])

  const removeTable = (tableId: string) => {
    if (isSharedView || demoMode) return

    const table = tables.find((t) => t.id === tableId)
    if (table) {
      const updatedTables = tables.filter((t) => t.id !== tableId)
      setTables(updatedTables)
      //saveToLocalStorage({ tables: updatedTables })
      toast({
        title: t("tableRemoved"),
        description: t("tableRemovedDescription", { name: table.name }),
      })
    }
  }

  const assignGuestToTable = (guestId: string, tableId: string | null) => {
    if (isSharedView || demoMode) return

    const guest = guests.find((g) => g.id === guestId)
    if (!guest) return

    // בדיקה אם האורח כבר משויך לשולחן זה
    const isAlreadyAssigned = tableId !== null && tables.some((t) => t.id === tableId && t.guests.includes(guestId))
    if (isAlreadyAssigned) return

    const updatedTables = tables.map((table) => {
      // הסרת האורח מכל השולחנות תחילה
      if (table.guests.includes(guestId)) {
        return { ...table, guests: table.guests.filter((id) => id !== guestId) }
      }

      // אם tableId הוא null, אנחנו רק מסירים את האורח
      if (tableId === null) {
        return table
      }

      // הוספת האורח לשולחן המצוין אם יש מספיק מקום
      if (table.id === tableId) {
        const currentOccupancy = table.guests.reduce((sum, id) => {
          const g = guests.find((guest) => guest.id === id)
          return sum + (g?.invitedCount || 0)
        }, 0)

        if (currentOccupancy + guest.invitedCount <= table.seats) {
          customToast.success("אורח שובץ", `האורח ${guest.fullName} שובץ בהצלחה לשולחן ${table.name}`)
          return { ...table, guests: [...table.guests, guestId] }
        } else {
          customToast.error("שגיאת שיבוץ", `אין מספיק מקום בשולחן ${table.name}`)
        }
      }
      return table
    })

    // עדכון הטבלאות במסד הנתונים
    const updatedTablesData = { tables: updatedTables }
    updateWeddingData(updatedTablesData, false)
  }

  const removeGuestFromTable = (guestId: string, tableId: string) => {
    if (isSharedView || demoMode) return

    const guest = guests.find((g) => g.id === guestId)
    const table = tables.find((t) => t.id === tableId)
    if (guest && table) {
      const updatedTables = tables.map((t) => {
        if (t.id === tableId) {
          return { ...t, guests: t.guests.filter((id) => id !== guestId) }
        }
        return t
      })
      setTables(updatedTables)
      //saveToLocalStorage({ tables: updatedTables })
      toast({
        title: t("guestRemoved"),
        description: t("guestRemovedDescription", { name: guest.fullName, table: table.name }),
      })
    }
  }

  const handleUpdateData = () => {
    if (!isSharedView) return

    // In a real app, this would be an API call to update the data
    // For now, we'll just refresh the data from localStorage
    setDataUpdated((prev) => !prev)
    customToast.success(t("dataUpdated"), t("dataUpdatedDescription"))
  }

  const unassignedGuests = guests.filter((guest) => !tables.some((table) => table.guests.includes(guest.id)))

  const totalGuests = guests.reduce((sum, guest) => sum + guest.invitedCount, 0)
  const assignedGuests = tables.reduce((sum, table) => {
    return (
      sum +
      table.guests.reduce((tableSum, guestId) => {
        const guest = guests.find((g) => g.id === guestId)
        return tableSum + (guest?.invitedCount || 0)
      }, 0)
    )
  }, 0)

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {isSharedView && (
          <div className="flex justify-end mb-4">
            <Button onClick={handleUpdateData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("refreshData")}
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{t("seatingTitle")}</CardTitle>
                <CardDescription>
                  {assignedGuests}/{totalGuests} {t("guestsAssigned")}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-base">
                {tables.reduce((sum, table) => sum + table.seats, 0)} {t("totalSeats")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!isSharedView && !demoMode && (
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="grow">
                  <Label htmlFor="tableName">{t("tableName")}</Label>
                  <Input
                    id="tableName"
                    placeholder={t("enterTableName")}
                    value={newTableName}
                    onChange={(e) => {
                      setNewTableName(e.target.value)
                      setTableTouched({ ...tableTouched, tableName: true })
                      if (tableTouched.tableName) {
                        setTableErrors({
                          ...tableErrors,
                          tableName: !e.target.value || e.target.value.trim() === "" ? "שם השולחן הוא שדה חובה" : "",
                        })
                      }
                    }}
                    className={tableErrors.tableName && tableTouched.tableName ? "border-red-500" : ""}
                  />
                  {tableErrors.tableName && tableTouched.tableName && (
                    <p className="text-red-500 text-sm mt-1">{tableErrors.tableName}</p>
                  )}
                </div>
                <div className="grow">
                  <Label htmlFor="tableSeats">{t("numberOfSeats")}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newValue = Math.max(1, newTableSeats - 1)
                        setNewTableSeats(newValue)
                        setTableTouched({ ...tableTouched, tableSeats: true })
                        if (tableTouched.tableSeats) {
                          setTableErrors({
                            ...tableErrors,
                            tableSeats: newValue <= 0 ? "מספר המקומות חייב להיות חיובי" : "",
                          })
                        }
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="tableSeats"
                      type="number"
                      min="1"
                      value={newTableSeats}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        setNewTableSeats(value)
                        setTableTouched({ ...tableTouched, tableSeats: true })
                        if (tableTouched.tableSeats) {
                          setTableErrors({
                            ...tableErrors,
                            tableSeats: !value || value <= 0 ? "מספר המקומות חייב להיות חיובי" : "",
                          })
                        }
                      }}
                      className={`w-20 text-center ${tableErrors.tableSeats && tableTouched.tableSeats ? "border-red-500" : ""}`}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setNewTableSeats((prev) => prev + 1)
                        setTableTouched({ ...tableTouched, tableSeats: true })
                        setTableErrors({ ...tableErrors, tableSeats: "" })
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tableErrors.tableSeats && tableTouched.tableSeats && (
                    <p className="text-red-500 text-sm mt-1">{tableErrors.tableSeats}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button onClick={addTable} disabled={!newTableName}>
                    <Plus className="mr-2 h-4 w-4" /> {t("addTable")}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {tables.map((table) => (
                  <TableComponent
                    key={table.id}
                    table={table}
                    guests={guests}
                    onRemoveGuest={removeGuestFromTable}
                    onAddGuest={assignGuestToTable}
                    onRemoveTable={removeTable}
                    isSharedView={isSharedView}
                  />
                ))}
              </AnimatePresence>
            </div>

            <UnassignedGuests guests={unassignedGuests} onAddGuest={assignGuestToTable} />
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  )
}

