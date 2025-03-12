export interface WeddingDetails {
  userId: string
  groomName: string
  brideName: string
  date: string
  venue: string
  estimatedGuests: number
  [key: string]: any // for any additional properties
}

export function createWedding(weddingDetails: WeddingDetails): Promise<{ success: boolean; message: string }>

