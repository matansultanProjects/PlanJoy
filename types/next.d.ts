import type { Metadata } from "next"

// Define the PageProps interface that Next.js expects
export interface PageProps {
  params: { [key: string]: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Define the type for generateMetadata function
export type GenerateMetadata = (props: PageProps) => Promise<Metadata> | Metadata

