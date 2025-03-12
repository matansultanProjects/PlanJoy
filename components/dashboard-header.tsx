import { CalendarHeart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings as CustomSettings } from "@/components/settings"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
          <CalendarHeart className="h-8 w-8 text-primary" />
          wedfull - מתכנן החתונה שלך
        </h1>
        <p className="text-lg text-muted-foreground">נהל את כל פרטי החתונה שלך במקום אחד</p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
            <Settings className="h-5 w-5" />
            <span className="sr-only">הגדרות</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">הגדרות</DialogTitle>
          </DialogHeader>
          <CustomSettings />
        </DialogContent>
      </Dialog>
    </div>
  )
}

