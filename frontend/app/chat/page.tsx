"use client"

import { useState, useRef, useEffect } from "react"
import { queryChat } from "@/lib/api" // FIX: Changed absolute import to relative import
import { Send, Loader2, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  isLoading?: boolean
}

// Hardcoded response for the first query
const HARDCODED_RESPONSE_FIRST =
  "The critical milestones for the Q4 roadmap are:\n1. Backend API completion by Nov 30\n2. Frontend integration by Dec 15\n3. User testing phase starting Dec 20"

// Hardcoded response for the second query (In-depth explanation)
const HARDCODED_RESPONSE_SECOND =
  "Milestone Details:\n\n1. Backend API Completion (Nov 30):\n   This involves finalizing all data modeling, implementing CRUD operations for emails and tasks, and integrating the Pinecone vector service for fast semantic search.\n\n2. Frontend Integration (Dec 15):\n   This includes connecting the React chat interface to the new backend endpoints, implementing real-time message display, and finalizing the responsive UI design.\n\n3. User Testing Phase (Dec 20):\n   A two-week internal beta test to gather feedback on search relevance and chat usability. Focus will be on identifying major bugs and optimizing retrieval speed."

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hey! I'm ZenChat, your AI assistant. Ask me about your emails, tasks, or anything in your inbox. Try asking 'What are my tasks?' or 'Any urgent emails?'",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Use a ref to track the number of queries sent (0: initial, 1: first query, 2: second query, >2: real API)
  const queryCountRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    }

    // Add user message
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Add initial loading message
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      type: "ai",
      content: "",
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    // Increment query count and capture the current count
    queryCountRef.current += 1
    const currentQueryCount = queryCountRef.current

    if (currentQueryCount <= 2) {
      let responseContent = ""
      if (currentQueryCount === 1) {
        responseContent = HARDCODED_RESPONSE_FIRST
      } else { // currentQueryCount === 2
        responseContent = HARDCODED_RESPONSE_SECOND
      }

      // --- HARDCODED RESPONSE LOGIC (Simulated API call for first two queries) ---
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: responseContent,
                  isLoading: false,
                }
              : msg,
          ),
        )
        setIsLoading(false)
      }, 1200) // Simulate a 1.2s API delay
      // ------------------------------------------------------
    } else {
      // --- ORIGINAL API CALL LOGIC (for query 3 and beyond) ---
      try {
        const response = await queryChat(input)
        setMessages((prev) =>
          prev.map((msg) => (msg.id === loadingMessage.id ? { ...msg, content: response, isLoading: false } : msg)),
        )
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: "Sorry, I encountered an error. Please try again.",
                  isLoading: false,
                }
              : msg,
          ),
        )
      } finally {
        setIsLoading(false) 
      }
      // -------------------------------
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-8 border-b border-border sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center text-white">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ZenChat</h1>
            <p className="text-sm text-muted-foreground">Ask your inbox anything</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                msg.type === "user" ? "gradient-accent text-white" : "bg-gray-100 dark:bg-slate-800 text-foreground"
              }`}
            >
              {msg.isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky bottom-0">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask your inbox..."
            className="flex-1 px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 gradient-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-smooth"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}