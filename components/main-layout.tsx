"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Moon,
  Sun,
  Menu,
  Home,
  Users,
  DollarSign,
  CheckSquare,
  Clock,
  Briefcase,
  Settings,
  Heart,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { SupportChat } from "@/components/support-chat"
// הסרנו את ייבוא ShareLink

// Full navigation items list - always use this for all users
const navItems = [
  { href: "/dashboard", label: "לוח בקרה", icon: Home },
  { href: "/wedding-details", label: "פרטי חתונה", icon: Heart },
  { href: "/guests", label: "רשימת אורחים", icon: Users },
  { href: "/seating", label: "סידורי הושבה", icon: Users },
  { href: "/budget", label: "תקציב", icon: DollarSign },
  { href: "/tasks", label: "משימות", icon: CheckSquare },
  { href: "/timeline", label: "ציר זמן", icon: Clock },
  { href: "/vendors", label: "ספקים", icon: Briefcase },
  { href: "/settings", label: "הגדרות", icon: Settings },
]

interface MainLayoutProps {
  children: React.ReactNode
  isSharedView?: boolean
}

export function MainLayout({ children, isSharedView = false }: MainLayoutProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, demoMode } = useAuth()
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    // Clear shared wedding data from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("viewingSharedWedding")
      localStorage.removeItem("sharedWeddingId")
    }

    await signOut()
    router.push("/login")
  }

  // Always use the full navigation items list
  const displayNavItems = navItems

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <motion.header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          scrollY > 0 && "border-b shadow-sm",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  {displayNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-2 space-x-reverse rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground",
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONPLANJOY.jpg-ngzVtWpXnMrvdM9DxQouO2uCK6AksF.jpeg"
                  alt="PlanJoy Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <span className="text-xl font-bold gradient-text">PlanJoy</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* הסרנו את כפתור השיתוף מכאן */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-full"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full" title="התנתק">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">התנתק</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Desktop Navigation Sidebar - Always show full menu */}
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] py-8">
        <aside className="hidden md:block w-[200px] h-fit">
          <nav className="sticky top-24 space-y-2 pr-1">
            {displayNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONPLANJOY.jpg-ngzVtWpXnMrvdM9DxQouO2uCK6AksF.jpeg"
              alt="PlanJoy Logo"
              width={24}
              height={24}
              className="rounded-full"
            />
            <p className="text-sm font-medium">PlanJoy - מתכנן החתונה שלך</p>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-right">נבנה באהבה עבור היום המיוחד שלכם ❤️</p>
        </div>
      </footer>
      <SupportChat />
    </div>
  )
}

