"use client"

import { useState, useEffect } from "react"
import { fetchEmails } from "@/lib/api"
import type { Email } from "@/lib/api"
import EmailList from "@/components/email-list"
import EmailDetail from "@/components/email-detail"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadEmails() {
      setIsLoading(true)
      const data = await fetchEmails()
      setEmails(data)
      setIsLoading(false)
    }
    loadEmails()
  }, [])

  return (
<div className="flex h-screen bg-transparent">
      {/* Email list */}
      <div className="w-1/3 glass-effect-subtle border-r border-white/20 dark:border-slate-700/20 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Syncing emails...</p>
            </div>
          </div>
        ) : (
          <EmailList emails={emails} selectedId={selectedEmail?.id} onSelectEmail={setSelectedEmail} />
        )}
      </div>

      {/* Email detail */}
      <div className="flex-1 glass-effect bg-white dark:bg-slate-900">
        {selectedEmail ? (
          <EmailDetail email={selectedEmail} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select an email to read</p>
          </div>
        )}
      </div>
    </div>
  )
}
