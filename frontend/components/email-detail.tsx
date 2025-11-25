"use client"

import { useState } from "react"
import type { Email } from "@/lib/api"
import ReplyModal from "./reply-modal"
import { Button } from "@/components/ui/button"

interface EmailDetailProps {
  email: Email
}

export default function EmailDetail({ email }: EmailDetailProps) {
  const [showReplyModal, setShowReplyModal] = useState(false)

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{email.subject}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src={email.senderAvatar || "/placeholder.svg"}
                    alt={email.sender}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{email.sender}</p>
                    <p className="text-sm text-muted-foreground">{email.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {email.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {email.tags.map((tag, idx) => (
                <span key={idx} className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${tag.color}`}>
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{email.body}</p>
          </div>
        </div>

        {/* Action footer */}
        <div className="p-6 border-t border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky bottom-0">
          <Button
            onClick={() => setShowReplyModal(true)}
            className="w-full gradient-accent text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-smooth"
          >
            Generate Reply
          </Button>
        </div>
      </div>

      {/* Reply modal */}
      {showReplyModal && <ReplyModal email={email} onClose={() => setShowReplyModal(false)} />}
    </>
  )
}
