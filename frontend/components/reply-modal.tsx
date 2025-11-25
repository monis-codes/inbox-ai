"use client"

import { useState, useEffect } from "react"
import { generateReply, saveDraft } from "@/lib/api"
import type { Email, Draft } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"
import { motion } from "framer-motion"

interface ReplyModalProps {
  email?: Email
  draft?: Draft
  onClose: () => void
}

export default function ReplyModal({ email, draft, onClose }: ReplyModalProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(!!email) // Only load if generating a reply
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (email) {
      // Generate new reply
      async function loadReply() {
        setIsLoading(true)
        const reply = await generateReply(email.id)
        setContent(reply)
        setIsLoading(false)
      }
      loadReply()
    } else if (draft) {
      // Load existing draft for editing
      setContent(draft.content)
    }
  }, [email, draft])

  const handleSave = async () => {
    setIsSaving(true)
    if (email) {
      // Saving a new reply as draft
      const newDraft: Draft = {
        id: draft?.id || `d-${Date.now()}`,
        emailReferenceId: email.id,
        emailSubject: `Re: ${email.subject}`,
        content,
        lastSaved: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      await saveDraft(newDraft)
    } else if (draft) {
      const updatedDraft: Draft = {
        ...draft,
        content,
        lastSaved: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      await saveDraft(updatedDraft)
    }
    setIsSaving(false)
    onClose()
  }

  const isEditing = !!draft
  const subject = email?.subject || draft?.emailSubject || "Draft"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50"
    >
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: "spring", damping: 30 }}
        className="w-full bg-white dark:bg-slate-900 rounded-t-2xl shadow-xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95">
          <div>
            <h3 className="font-bold text-lg">{isEditing ? "Edit Draft" : "Auto-Reply Draft"}</h3>
            <p className="text-sm text-muted-foreground">Re: {subject}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground">Generating reply...</p>
              </div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 p-4 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur flex gap-3 sticky bottom-0">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Discard
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving} className="flex-1 gradient-accent text-white">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save to Drafts"
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
