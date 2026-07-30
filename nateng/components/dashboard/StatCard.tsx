"use client"

import { type LucideIcon } from "lucide-react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import Link from "next/link"

interface StatCardProps {
  label: string
  value: string
  change: string
  increasing: boolean
  icon: LucideIcon
  color: string
  href?: string
}

export function StatCard({ label, value, change, increasing, icon: Icon, color, href }: StatCardProps) {
  const cardContent = (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${increasing ? "text-emerald-600" : "text-muted-foreground"}`}
        >
          {increasing ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="group">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}