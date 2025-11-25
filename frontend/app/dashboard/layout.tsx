import type React from "react"
// Ensure there is a default export in the layout file
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Header or navigation can be placed here */}
      <header>
        <h1>Dashboard</h1>
      </header>
      <main>{children}</main>
      {/* Footer can be placed here */}
      <footer>
        <p>© 2023 Dashboard</p>
      </footer>
    </div>
  )
}
