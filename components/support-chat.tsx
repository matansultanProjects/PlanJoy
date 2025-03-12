"use client"

import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageSquare, X, Send, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

type SuggestedQuestion = {
  id: string
  text: string
}

const suggestedQuestions: SuggestedQuestion[] = [
  { id: "q1", text: "מה זה wedfull?" },
  { id: "q2", text: "איך מתחילים לתכנן חתונה?" },
  { id: "q3", text: "איך מנהלים את רשימת האורחים?" },
  { id: "q4", text: "איך מנהלים את התקציב?" },
  { id: "q5", text: "איך יוצרים סידורי הושבה?" },
]

const faqResponses: Record<string, string> = {
  q1: "wedfull הוא פלטפורמה מקיפה לתכנון חתונה שמאפשרת לך לנהל את כל ההיבטים של האירוע שלך במקום אחד - מרשימת אורחים ותקציב ועד ספקים וסידורי הושבה.",
  q2: "התחילו בהגדרת פרטי החתונה הבסיסיים כמו תאריך ומקום. לאחר מכן, הוסיפו את רשימת האורחים שלכם והתחילו לעקוב אחר התקציב. המערכת תיצור לכם רשימת משימות מומלצת לפי לוח הזמנים שלכם.",
  q3: "בלשונית 'רשימת אורחים' תוכלו להוסיף אורחים, לסמן אישורי הגעה, להוסיף הערות מיוחדות ולייבא/לייצא את הרשימה לאקסל. המערכת מאפשרת גם לסנן ולחפש אורחים לפי קטגוריות שונות.",
  q4: "בלשונית 'תקציב' תוכלו להגדיר את התקציב הכולל, להוסיף הוצאות לפי קטגוריות, לעקוב אחר תשלומים ומקדמות ולראות גרפים וניתוחים של ההוצאות שלכם.",
  q5: "בלשונית 'סידורי הושבה' תוכלו ליצור שולחנות, להגדיר את מספר המקומות בכל שולחן ולגרור אורחים לשולחנות השונים. המערכת תתריע אם שולחן מלא מדי.",
}

const generalResponses = [
  "אנחנו כאן כדי לעזור לך לתכנן את החתונה המושלמת!",
  "אל תהססו לשאול כל שאלה לגבי תכנון החתונה שלכם.",
  "אם אתם מתקשים במשהו ספציפי, אשמח לעזור.",
  "יש לכם שאלות נוספות? אני כאן בשבילכם.",
]

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "שלום! אני העוזר הווירטואלי של wedfull. איך אוכל לעזור לך היום?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [isOpen]) // Removed unnecessary dependency: messages

  const handleSend = () => {
    if (inputValue.trim() === "") return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const handleQuestionClick = (questionId: string) => {
    const question = suggestedQuestions.find((q) => q.id === questionId)
    if (!question) return //This line was already present in the original code

    const userMessage: Message = {
      id: Date.now().toString(),
      content: question.text,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: faqResponses[questionId] || "אני לא יכול לענות על שאלה זו כרגע.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const getResponse = (message: string): string => {
    // Simple keyword matching for responses
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("שלום") || lowerMessage.includes("היי")) {
      return "שלום! איך אני יכול לעזור לך היום?"
    }

    if (lowerMessage.includes("תודה")) {
      return "בשמחה! אני כאן אם תצטרכו עוד עזרה."
    }

    if (lowerMessage.includes("תקציב") || lowerMessage.includes("כסף") || lowerMessage.includes("עלות")) {
      return "בלשונית 'תקציב' תוכלו לנהל את כל ההוצאות שלכם, להגדיר תקציב כולל ולעקוב אחר התשלומים והמקדמות."
    }

    if (lowerMessage.includes("אורח") || lowerMessage.includes("מוזמנ")) {
      return "ניהול רשימת האורחים הוא פשוט! עברו ללשונית 'רשימת אורחים' כדי להוסיף, לערוך ולנהל את כל המוזמנים שלכם."
    }

    if (lowerMessage.includes("ספק") || lowerMessage.includes("שירות")) {
      return "בלשונית 'ספקים' תוכלו לנהל את כל הספקים שלכם, לשמור פרטי קשר, לעקוב אחר תשלומים ולדרג את השירות."
    }

    if (lowerMessage.includes("תאריך") || lowerMessage.includes("מועד") || lowerMessage.includes("יום")) {
      return "בחירת תאריך היא אחת ההחלטות החשובות ביותר! בדקו זמינות של המקום והספקים המועדפים עליכם לפני שתקבעו תאריך סופי."
    }

    if (lowerMessage.includes("מקום") || lowerMessage.includes("אולם") || lowerMessage.includes("גן")) {
      return "בחירת מקום לאירוע היא החלטה משמעותית. מומלץ לבקר במספר מקומות, לבדוק זמינות לתאריך הרצוי ולוודא שהמקום מתאים לכמות האורחים המשוערת."
    }

    // Default response if no keywords match
    return generalResponses[Math.floor(Math.random() * generalResponses.length)]
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Chat button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-80 md:w-96"
          >
            <Card className="border-primary/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/90 to-pink-500/90 text-white p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src="/wedfull-logo.png" alt="Wedfull Support" />
                    <AvatarFallback className="bg-primary-foreground text-primary">WF</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">תמיכת wedfull</h3>
                    <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                      מקוון
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-white hover:bg-white/20"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="p-4 h-80 overflow-y-auto bg-muted/30">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1 text-left">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  <div className="p-3 bg-muted/10 border-t">
                    <p className="text-sm font-medium mb-2">שאלות נפוצות:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {suggestedQuestions.map((question) => (
                        <Badge
                          key={question.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => handleQuestionClick(question.id)}
                        >
                          {question.text}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <CardFooter className="p-3 pt-0">
                    <div className="flex w-full gap-2">
                      <Input
                        placeholder="הקלד הודעה..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="flex-1"
                      />
                      <Button size="icon" onClick={handleSend} className="bg-primary hover:bg-primary/90">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

