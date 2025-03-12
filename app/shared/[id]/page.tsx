import SharedView from "@/components/shared/SharedView"
import type { Metadata } from "next"

export default function SharedPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <SharedView id={params.id} />
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  return {
    title: "צפייה בחתונה משותפת",
    description: "צפייה בפרטי חתונה שהוזמנת אליה",
  }
}

