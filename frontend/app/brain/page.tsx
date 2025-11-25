"use client"

import { useState, useEffect } from "react"
import { fetchPrompts, updatePrompts } from "@/lib/api"
import type { Prompts } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Loader2, Save, Info } from "lucide-react"
import { motion } from "framer-motion"

const promptSections = [
  {
    id: "categorization",
    title: "Categorization Prompt",
    description: "Logic for tagging emails (Urgent, To-Do, Newsletter, etc.)",
    icon: "🏷️",
  },
  {
    id: "reply",
    title: "Auto-Reply Prompt",
    description: "Tone and style for generating email replies",
    icon: "✍️",
  },
  {
    id: "rag",
    title: "RAG Instructions",
    description: "How the chat agent behaves when answering questions",
    icon: "🤖",
  },
]

export default function BrainPage() {
  const [prompts, setPrompts] = useState<Prompts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    async function loadPrompts() {
      setIsLoading(true)
      const data = await fetchPrompts()
      setPrompts(data)
      setIsLoading(false)
    }
    loadPrompts()
  }, [])

  const handleUpdatePrompt = (key: keyof Prompts, value: string) => {
    if (prompts) {
      setPrompts({ ...prompts, [key]: value })
    }
  }

  const handleSave = async () => {
    if (!prompts) return
    setIsSaving(true)
    await updatePrompts(prompts)
    setSaveMessage("Configuration saved!")
    setTimeout(() => setSaveMessage(""), 3000)
    setIsSaving(false)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-8 border-b border-border sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <h1 className="text-3xl font-bold mb-1">Brain</h1>
        <p className="text-muted-foreground">Edit your AI prompts and configuration</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Loading configuration...</p>
            </div>
          </div>
        ) : prompts ? (
          <div className="max-w-4xl space-y-6">
            {promptSections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border border-border rounded-xl p-6 bg-card"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{section.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>

                <textarea
                  value={prompts[section.id as keyof Prompts] || ""}
                  onChange={(e) => handleUpdatePrompt(section.id as keyof Prompts, e.target.value)}
                  className="w-full p-4 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  rows={6}
                />

                {section.id === "categorization" && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Tip: You can add natural language rules here, e.g., &quot;Mark all HR emails as Urgent&quot;
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Save button */}
      <div className="p-6 border-t border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky bottom-0 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {saveMessage && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 dark:text-green-400"
            >
              {saveMessage}
            </motion.span>
          )}
        </div>
        <Button onClick={handleSave} disabled={isLoading || isSaving} className="gradient-accent text-white">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
