"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Inbox, FileText, Sparkles, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "inbox", label: "Inbox", icon: Inbox, href: "/" },
  { id: "drafts", label: "Drafts", icon: FileText, href: "/drafts" },
  { id: "chat", label: "ZenChat", icon: Sparkles, href: "/chat" },
  { id: "brain", label: "Brain", icon: Settings, href: "/brain" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-full glass-effect border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center text-white font-bold">
            Z
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">ZenBox AI</h1>
            <p className="text-xs text-muted-foreground">Email Agent</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth cursor-pointer",
                isActive
                  ? "gradient-accent text-white shadow-lg"
                  : "text-sidebar-foreground hover:bg-white/50 dark:hover:bg-slate-800/50",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">Syncing with Inbox...</p>
      </div>
    </div>
  )
}
