"use client"

import { useState, useEffect } from "react"
import { fetchDrafts } from "@/lib/api"
import type { Draft } from "@/lib/api"
import { Loader2, FileText, Clock, Pencil } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReplyModal from "@/components/reply-modal"

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)

  useEffect(() => {
    async function loadDrafts() {
      setIsLoading(true)
      const data = await fetchDrafts()
      setDrafts(data)
      setIsLoading(false)
    }
    loadDrafts()
  }, [])

  const handleEditClose = () => {
    setSelectedDraft(null)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-8 border-b border-border sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <h1 className="text-3xl font-bold">Drafts</h1>
        <p className="text-muted-foreground mt-1">
          {drafts.length} saved draft{drafts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Loading drafts...</p>
            </div>
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No drafts yet</p>
          </div>
        ) : (
          <div className="grid gap-4 max-w-4xl">
            {drafts.map((draft, idx) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 border border-border rounded-lg hover:shadow-md transition-smooth bg-card hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-between group"
              >
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-white flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{draft.emailSubject}</h3>
                    <p className="text-sm text-muted-foreground truncate mt-1">{draft.content.slice(0, 100)}...</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {draft.lastSaved}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDraft(draft)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-smooth opacity-0 group-hover:opacity-100 ml-4 flex-shrink-0"
                  title="Edit draft"
                >
                  <Pencil className="w-5 h-5 text-foreground" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedDraft && <ReplyModal draft={selectedDraft} onClose={handleEditClose} />}
      </AnimatePresence>
    </div>
  )
}
