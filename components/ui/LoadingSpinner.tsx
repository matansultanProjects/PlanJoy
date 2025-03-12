import { cn } from "@/lib/utils"

type SpinnerSize = "small" | "medium" | "large"

interface LoadingSpinnerProps {
  size?: SpinnerSize
  className?: string
}

const sizeClasses = {
  small: "h-4 w-4 border-2",
  medium: "h-8 w-8 border-3",
  large: "h-12 w-12 border-4",
}

export default function LoadingSpinner({ size = "medium", className }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-primary border-t-transparent",
          sizeClasses[size],
          className,
        )}
      />
    </div>
  )
}

