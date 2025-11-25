"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Mail, Zap, Brain, MessageCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileText, Database } from "lucide-react"

const features = [
  {
    icon: Mail,
    title: "Smart Email Management",
    description: "Automatically categorize, prioritize, and organize your emails with AI-powered intelligence.",
  },
  {
    icon: Zap,
    title: "Lightning-Fast Replies",
    description: "Generate professional email responses in seconds using advanced language models.",
  },
  {
    icon: Brain,
    title: "Customizable AI Brain",
    description: "Fine-tune your AI's behavior with custom prompts for categorization, replies, and more.",
  },
  {
    icon: MessageCircle,
    title: "ZenChat Assistant",
    description: "Ask natural language questions about your inbox and get instant, intelligent answers.",
  },
  {
    icon: FileText,
    title: "Draft Management",
    description: "Keep track of your email drafts and edit them anytime before sending.",
  },
  {
    icon: Database,
    title: "Bulk Import",
    description: "Upload JSON files to quickly import and organize your email collections.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent pt-20 pb-20 px-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance">
          Your AI-Powered{" "}
          <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
            Email Assistant
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          ZenBox transforms your inbox with intelligent automation, smart replies, and AI-driven insights. Stay
          organized, respond faster, and reclaim your time.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-8">
          <Link href="/">
            <Button size="lg" className="gradient-accent text-white text-lg px-8 py-6 h-auto">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto bg-transparent">
            Learn More
          </Button>
        </div>

        {/* Showcase banner */}
        <div className="glass-effect rounded-2xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-muted-foreground mb-4">TRUSTED BY PRODUCTIVITY ENTHUSIASTS</p>
          <div className="flex justify-center gap-8 flex-wrap">
            {["87% faster replies", "Inbox organized in seconds", "AI-trained on your workflow"].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-500" />
                <span className="font-semibold text-foreground">{stat}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="max-w-6xl mx-auto w-full mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Powerful Features</h2>
        <p className="text-center text-muted-foreground text-lg mb-12">
          Everything you need to master your email workflow
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.6 }}
                className="glass-effect p-6 rounded-xl hover:shadow-lg transition-smooth border border-white/20 hover:border-cyan-500/50 group"
              >
                <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="glass-effect rounded-2xl p-12 text-center max-w-3xl mx-auto w-full border border-white/20"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Email?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join thousands of professionals who have taken control of their inbox with ZenBox AI.
        </p>
        <Link href="/">
          <Button size="lg" className="gradient-accent text-white text-lg px-8 py-6 h-auto">
            Start Your Journey
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
