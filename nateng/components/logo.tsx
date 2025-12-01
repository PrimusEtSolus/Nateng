import { Leaf } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "light" | "dark" | "farmer" | "buyer" | "business" | "reseller"
}

export function Logo({ size = "md", variant = "light" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  const textSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
  }

  const colorClasses = {
    light: "text-white",
    dark: "text-[#064E3B]",
    farmer: "text-[#A16207]",
    buyer: "text-[#F97316]",
    business: "text-[#0891B2]",
    reseller: "text-[#0D9488]",
  }

  const bgClasses = {
    light: "bg-white/20",
    dark: "bg-[#064E3B]/10",
    farmer: "bg-[#A16207]/10",
    buyer: "bg-[#F97316]/10",
    business: "bg-[#0891B2]/10",
    reseller: "bg-[#0D9488]/10",
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} ${bgClasses[variant]} rounded-lg flex items-center justify-center`}>
        <Leaf
          className={`${size === "lg" ? "w-8 h-8" : size === "md" ? "w-6 h-6" : "w-4 h-4"} ${colorClasses[variant]}`}
        />
      </div>
      <span className={`${textSizes[size]} font-semibold tracking-tight ${colorClasses[variant]}`}>NatengHub</span>
    </div>
  )
}
