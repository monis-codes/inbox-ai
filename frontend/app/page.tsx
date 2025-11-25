"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Mail, Zap, Brain, MessageCircle, FileText, Database, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

// --- Component Data ---
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
    title: "Bulk Import & Sync", // Improved title
    description: "Upload JSON files or sync with external services to quickly import and organize your email collections.",
  },
]

// Custom variant for smoother staggered animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger effect for children
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

// --- Main Component ---
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col pt-20 pb-32 px-4 overflow-hidden">
      {/* Background Gradient & Pattern */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 opacity-10 dark:opacity-5 [mask-image:radial-gradient(100%_100%_at_top,transparent_30%,white)] dark:[mask-image:radial-gradient(100%_100%_at_top,transparent_30%,black)]">
          {/* Subtle background texture/pattern can be added here */}
        </div>
      </div>
      
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants} // Use container variant for full section
        className="text-center mb-24 relative max-w-6xl mx-auto w-full"
      >
        <motion.h1 
          variants={itemVariants} 
          className="text-6xl md:text-7xl font-extrabold mb-6 text-balance tracking-tighter text-slate-900 dark:text-white"
        >
          Your AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">Email Assistant</span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants} 
          className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto text-balance"
        >
          ZenBox transforms your inbox with intelligent automation, smart replies, and AI-driven insights. **Stay
          organized, respond faster, and reclaim your time.**
        </motion.p>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-4 justify-center flex-wrap mb-12">
          <Link href="/dashboard" passHref legacyBehavior>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 h-auto shadow-lg shadow-blue-500/50 transition-all duration-300 ease-out hover:scale-[1.03]">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          {/* <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Book a Demo
          </Button> */}
        </motion.div>

        {/* Showcase banner - Applied a more defined "frosted glass" style */}
        <motion.div 
            variants={itemVariants}
            className="rounded-2xl p-6 md:p-8 max-w-4xl mx-auto border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50"
        >
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
            TRUSTED BY PRODUCTIVITY ENTHUSIASTS
          </p>
          <div className="flex justify-center gap-6 md:gap-10 flex-wrap">
            <StatPill icon={TrendingUp} text="87% faster replies" />
            <StatPill icon={Shield} text="Data Security Guaranteed" />
            <StatPill icon={Brain} text="AI-trained on your workflow" />
          </div>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }} // Animation on scroll/view
        variants={containerVariants}
        className="max-w-6xl mx-auto w-full mb-32"
      >
        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900 dark:text-white">
          Powerful Features
        </motion.h2>
        <motion.p variants={itemVariants} className="text-center text-slate-600 dark:text-slate-300 text-lg mb-16 max-w-3xl mx-auto">
          Everything you need to master your email workflow and regain focus.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} idx={idx} />
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto w-full 
          bg-blue-600 dark:bg-blue-800 shadow-2xl shadow-blue-500/50 dark:shadow-blue-900/70 relative"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Ready to Transform Your Email?
        </h2>
        <p className="text-lg text-blue-100 dark:text-blue-200 mb-10">
          Join thousands of professionals who have taken control of their inbox with ZenBox AI. Start your 7-day free trial today!
        </p>
        <Link href="/dashboard" passHref legacyBehavior>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-6 h-auto font-semibold shadow-lg shadow-black/20">
            Start Your Journey
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

// --- Sub-Components for better readability and maintainability ---

// 1. Feature Card Component
const FeatureCard = ({ feature, idx }) => {
    const Icon = feature.icon
    return (
        <motion.div
            variants={itemVariants}
            className="relative p-6 rounded-xl border border-slate-200 dark:border-slate-800 
                bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out
                hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-900/50 
                transform hover:-translate-y-1 group"
        >
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            {/* Content */}
            <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-base">{feature.description}</p>
        </motion.div>
    )
}

// 2. Stat Pill Component
const StatPill = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-700/60 rounded-full py-2 px-4 border border-slate-200/80 dark:border-slate-700/80">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{text}</span>
    </div>
)