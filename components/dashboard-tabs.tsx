"use client"

import type * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardTabsProps {
  tabs: {
    id: string
    label: string
    content: React.ReactNode
  }[]
}

export function DashboardTabs({ tabs }: DashboardTabsProps) {
  return (
    <Tabs defaultValue={tabs[0].id} className="space-y-4">
      <TabsList className="w-full justify-start">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

