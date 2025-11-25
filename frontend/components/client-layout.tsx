"use client"

import type React from "react"
import Navbar from "@/components/navbar"
import { usePathname } from "next/navigation"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const shouldShowNavbar = pathname !== "/login" && pathname !== "/signup"

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <main className="mt-16 h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-br from-transparent to-transparent">
        {children}
      </main>
    </>
  )
}
