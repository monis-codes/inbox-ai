"use client"

import { motion } from "framer-motion"
import type { Email } from "@/lib/api"
import { cn } from "@/lib/utils"

interface EmailListProps {
  emails: Email[]
  selectedId?: string
  onSelectEmail: (email: Email) => void
}

export default function EmailList({ emails, selectedId, onSelectEmail }: EmailListProps) {
  return (
    <div className="divide-y divide-border">
      {emails.map((email, idx) => (
        <motion.div
          key={email.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onSelectEmail(email)}
          className={cn(
            "p-4 cursor-pointer transition-smooth hover:bg-gray-50 dark:hover:bg-slate-800",
            selectedId === email.id && "bg-blue-50 dark:bg-blue-950/20",
          )}
        >
          <div className="flex gap-3">
            {/* Avatar */}
            <img src={email.senderAvatar || "/placeholder.svg"} alt={email.sender} className="w-10 h-10 rounded-full" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className={cn("font-semibold truncate", !email.read && "font-bold")}>{email.sender}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{email.date}</span>
              </div>

              <p className="text-sm font-medium text-foreground truncate mb-1">{email.subject}</p>

              <div className="flex items-center gap-2 mb-2">
                {email.tags.map((tag, idx) => (
                  <span key={idx} className={cn("inline-block px-2 py-0.5 text-xs font-medium rounded", tag.color)}>
                    {tag.label}
                  </span>
                ))}
              </div>

              <p className="text-sm text-muted-foreground truncate">{email.preview}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
