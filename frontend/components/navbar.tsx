"use client"
import Link from "next/link"
import type React from "react"

import { usePathname } from "next/navigation"
import { Inbox, FileText, Sparkles, Settings, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef } from "react"
import { Button } from "@/components/ui/button"

const tabs = [
  { id: "inbox", label: "Inbox", icon: Inbox, href: "/dashboard" },
  { id: "drafts", label: "Drafts", icon: FileText, href: "/drafts" },
  { id: "chat", label: "ZenChat", icon: Sparkles, href: "/chat" },
  { id: "brain", label: "Brain", icon: Settings, href: "/brain" },
]

export default function Navbar() {
  const pathname = usePathname()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isLandingPage = pathname === "/"

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("[v0] File selected:", file.name)
      // Handle JSON file upload for email upserting
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          console.log("[v0] Parsed JSON data:", data)
          // TODO: Send to API for upserting emails
        } catch (error) {
          console.error("[v0] Invalid JSON file:", error)
        }
      }
      reader.readAsText(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg border-b border-white/20 dark:border-slate-700/20">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href={isLandingPage ? "/" : "/dashboard"}>
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center text-white font-bold">
              Z
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">ZenBox AI</h1>
            </div>
          </div>
        </Link>

        {/* Navigation tabs */}
        {!isLandingPage && (
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = pathname === tab.href

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth cursor-pointer text-sm font-medium",
                    isActive
                      ? "gradient-accent text-white shadow-md"
                      : "text-foreground hover:bg-black/5 dark:hover:bg-white/10",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Landing nav buttons */}
        {isLandingPage && (
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-foreground hover:text-primary transition-colors font-medium hidden sm:block"
            >
              Explore App
            </Link>
          </div>
        )}

        {/* Upload button */}
        {!isLandingPage && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleUploadClick}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload JSON</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload email JSON file"
            />
          </div>
        )}
      </div>
    </nav>
  )
}
