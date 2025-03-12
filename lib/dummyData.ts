import type { WeddingDetails, Guest, Task, BudgetItem, Vendor, TimelineEvent, Table } from "./types"

export const dummyWeddingDetails: WeddingDetails = {
  groomName: "ישראל ישראלי",
  brideName: "ישראלה ישראלי",
  date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
  venue: "אולם האחוזה",
  estimatedGuests: 200,
}

export const dummyGuests: Guest[] = [
  {
    id: "1",
    fullName: "דוד כהן",
    phoneNumber: "050-1234567",
    relation: "משפחה",
    invitedCount: 4,
    confirmed: "כן",
    specialNotes: "אלרגי לאגוזים",
  },
  {
    id: "2",
    fullName: "רחל לוי",
    phoneNumber: "052-7654321",
    relation: "חברים",
    invitedCount: 2,
    confirmed: "אולי",
    specialNotes: "",
  },
  {
    id: "3",
    fullName: "יוסי גולדברג",
    phoneNumber: "054-9876543",
    relation: "עבודה",
    invitedCount: 1,
    confirmed: "לא",
    specialNotes: "צמחוני",
  },
  {
    id: "4",
    fullName: "שרה אברהמי",
    phoneNumber: "053-1112222",
    relation: "משפחה",
    invitedCount: 3,
    confirmed: "כן",
    specialNotes: "",
  },
  {
    id: "5",
    fullName: "משה דוד",
    phoneNumber: "058-3334444",
    relation: "חברים",
    invitedCount: 2,
    confirmed: "כן",
    specialNotes: "נגיש לכיסא גלגלים",
  },
]

export const dummyTasks: Task[] = [
  {
    id: "1",
    title: "בחירת שמלת כלה",
    description: "קביעת תורים למדידות",
    dueDate: "2023-08-15",
    completed: true,
    category: "הכנות",
  },
  {
    id: "2",
    title: "הזמנת די-ג'יי",
    description: "לבדוק המלצות ולסגור חוזה",
    dueDate: "2023-09-01",
    completed: false,
    category: "ספקים",
  },
  {
    id: "3",
    title: "סידורי הושבה",
    description: "תכנון סידורי הישיבה לאורחים",
    dueDate: "2023-10-20",
    completed: false,
    category: "תכנון",
  },
  {
    id: "4",
    title: "הזמנת עוגת חתונה",
    description: "בחירת טעמים ועיצוב",
    dueDate: "2023-09-30",
    completed: false,
    category: "ספקים",
  },
  {
    id: "5",
    title: "רישום לנישואין",
    description: "הגשת מסמכים לרבנות",
    dueDate: "2023-08-30",
    completed: true,
    category: "משפטי",
  },
]

export const dummyBudgetItems: BudgetItem[] = [
  { id: "1", category: "אולם", description: "מקדמה לאולם", planned: 20000, deposit: 10000, actual: null },
  { id: "2", category: "קייטרינג", description: "תשלום ראשון לקייטרינג", planned: 30000, deposit: 15000, actual: null },
  { id: "3", category: "שמלת כלה", description: "תשלום מקדמה לשמלה", planned: 8000, deposit: 4000, actual: null },
  { id: "4", category: "צלם", description: "מקדמה לצלם", planned: 5000, deposit: 2500, actual: null },
  { id: "5", category: "מוזיקה", description: "תשלום לדי-ג'יי", planned: 3000, deposit: 1500, actual: null },
]

export const dummyVendors: Vendor[] = [
  {
    id: "1",
    name: "אולם האחוזה",
    category: "אולם",
    contact: "שרה",
    phone: "03-1234567",
    email: "ahuzah@example.com",
    status: "מאושר",
    cost: 20000,
  },
  {
    id: "2",
    name: "הקייטרינג של יוסי",
    category: "קייטרינג",
    contact: "יוסי",
    phone: "054-7654321",
    email: "yossi@example.com",
    status: "מאושר",
    cost: 30000,
  },
  {
    id: "3",
    name: "צלמים מקצוענים",
    category: "צילום",
    contact: "דנה",
    phone: "052-9876543",
    email: "dana@example.com",
    status: "בתהליך",
    cost: 5000,
  },
  {
    id: "4",
    name: "שמלות כלה של רחל",
    category: "שמלת כלה",
    contact: "רחל",
    phone: "050-1112222",
    email: "rachel@example.com",
    status: "מאושר",
    cost: 8000,
  },
  {
    id: "5",
    name: "די-ג'יי אלון",
    category: "מוזיקה",
    contact: "אלון",
    phone: "053-3334444",
    email: "alon@example.com",
    status: "בתהליך",
    cost: 3000,
  },
]

export const dummyTimelineEvents: TimelineEvent[] = [
  {
    id: "1",
    title: "פגישה עם מעצבת שמלות",
    date: "2023-08-10",
    description: "בחירת סגנון ומדידות ראשוניות",
    status: "completed",
  },
  { id: "2", title: "טעימות אצל הקייטרינג", date: "2023-09-05", description: "בחירת תפריט לאירוע", status: "upcoming" },
  { id: "3", title: "הכנת הזמנות", date: "2023-09-20", description: "עיצוב והדפסת ההזמנות", status: "warning" },
  { id: "4", title: "פגישה עם הצלם", date: "2023-10-01", description: "תיאום ציפיות וסגנון צילום", status: "upcoming" },
  { id: "5", title: "מסיבת רווקות", date: "2023-10-15", description: "ארגון והכנות אחרונות", status: "upcoming" },
]

export const dummyTables: Table[] = [
  { id: "1", name: "שולחן משפחה 1", seats: 10, guests: ["1", "4"] },
  { id: "2", name: "שולחן חברים 1", seats: 8, guests: ["2", "5"] },
  { id: "3", name: "שולחן עבודה", seats: 6, guests: ["3"] },
  { id: "4", name: "שולחן משפחה 2", seats: 10, guests: [] },
  { id: "5", name: "שולחן חברים 2", seats: 8, guests: [] },
]

