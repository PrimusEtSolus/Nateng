"use client"

import { useState } from "react"
import { Image as ImageIcon, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src?: string | null
  alt: string
  className?: string
  fallbackIcon?: React.ReactNode
}

export function ProductImage({ src, alt, className, fallbackIcon }: ProductImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50",
          className
        )}
      >
        {fallbackIcon || (
          <div className="text-center">
            <Leaf className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{alt}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {loading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground animate-pulse" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
      />
    </div>
  )
}

