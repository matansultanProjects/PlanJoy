"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { CalendarHeart, Check, ArrowRight, Star, Users, DollarSign, Clock, Briefcase } from "lucide-react"
import { SupportChat } from "@/components/support-chat"
import { useTranslation } from "@/hooks/useTranslation"

const testimonials = [
  {
    name: "רון ומאיה",
    text: "הפלטפורמה הזו עזרה לנו כל כך בתכנון החתונה שלנו! כל המשימות והספקים במקום אחד.",
    image: "/wedfull-logo.png",
    rating: 5,
  },
  {
    name: "דניאל ושירה",
    text: "ממליצים בחום! חסך לנו המון זמן וכאב ראש בתכנון החתונה.",
    image: "/wedfull-logo.png",
    rating: 5,
  },
  {
    name: "עידן ונועה",
    text: "הכלי המושלם לניהול אירוע! מאוד אינטואיטיבי ונוח לשימוש.",
    image: "/wedfull-logo.png",
    rating: 5,
  },
]

const features = [
  {
    title: "guestManagement",
    description: "guestManagementDescription",
    icon: Users,
  },
  {
    title: "budgetManagement",
    description: "budgetManagementDescription",
    icon: DollarSign,
  },
  {
    title: "vendorManagement",
    description: "vendorManagementDescription",
    icon: Briefcase,
  },
  {
    title: "taskManagement",
    description: "taskManagementDescription",
    icon: Clock,
  },
]

export function LandingPage() {
  const { t } = useTranslation()

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.src = "/placeholder.svg?height=100&width=100" // Fallback to placeholder
    target.onerror = null // Prevent infinite error loop
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/70 to-secondary/30">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-primary/90 to-pink-500/90 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONPLANJOY.jpg-ngzVtWpXnMrvdM9DxQouO2uCK6AksF.jpeg"
              alt="PlanJoy Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-2xl font-bold text-white">PlanJoy</span>
          </Link>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                {t("login")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8 flex justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONPLANJOY.jpg-ngzVtWpXnMrvdM9DxQouO2uCK6AksF.jpeg"
              alt="PlanJoy Logo"
              width={120}
              height={120}
              className="rounded-full"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text leading-tight">{t("landingPageTitle")}</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">{t("landingPageDescription")}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 h-12 animate-pulse">
                {t("startFree")}
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 h-12">
                {t("learnMore")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 gradient-text">{t("featuresTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-none shadow-card h-full card-hover">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="text-4xl mb-4 bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t(feature.title)}</h3>
                  <p className="text-muted-foreground">{t(feature.description)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">{t("whyWedfull")}</h2>
            <div className="space-y-4">
              {[
                "userFriendlyInterface",
                "accessibleFromAnywhere",
                "readyMadeTemplates",
                "smartNotifications",
                "collaborationWithPartner",
                "supportInHebrew",
                "advancedSecurity",
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p>{t(benefit)}</p>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  {t("startPlanning")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <Image
              src="dashboard-preview.png"
              alt="Wedfull Dashboard Preview"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
              onError={handleImageError}
            />
            <div className="absolute -bottom-6 -right-6 bg-background rounded-xl shadow-card p-4 max-w-xs">
              <p className="text-sm font-medium">{t("testimonialQuote")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 gradient-text">{t("howItWorks")}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "easyRegistration", description: "easyRegistrationDescription", icon: CalendarHeart },
            { title: "startPlanningNow", description: "startPlanningNowDescription", icon: Check },
            { title: "celebrateBig", description: "celebrateBigDescription", icon: Users },
          ].map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="bg-primary/10 text-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t(step.title)}</h3>
              <p className="text-muted-foreground">{t(step.description)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-12">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 gradient-text">{t("testimonialsTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-none shadow-card h-full card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4 border-2 border-primary/20"
                      onError={handleImageError}
                    />
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{testimonial.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">{t("ctaTitle")}</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t("ctaDescription")}</p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 h-12 animate-pulse">
              {t("createFreeAccount")}
              <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 bg-muted/30">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ICONPLANJOY.jpg-ngzVtWpXnMrvdM9DxQouO2uCK6AksF.jpeg"
              alt="PlanJoy Logo"
              width={32}
              height={32}
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

export default LandingPage

