interface PlaceholderImageProps {
  width: number
  height: number
  text?: string
  className?: string
}

export function PlaceholderImage({ width, height, text, className }: PlaceholderImageProps) {
  const aspectRatio = width / height

  return (
    <div
      className={`bg-muted flex items-center justify-center ${className}`}
      style={{
        width,
        height,
        aspectRatio,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {text ? (
        <span className="text-muted-foreground text-sm">{text}</span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={Math.min(width * 0.5, 100)}
          height={Math.min(height * 0.5, 100)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground/50"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      )}
    </div>
  )
}

