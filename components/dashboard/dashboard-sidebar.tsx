"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Building2, PlusCircle, Settings, Menu, X } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  role: "admin" | "agent"
}

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const adminLinks = [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/form-fields", label: "Form Fields", icon: Settings },
  ]

  const agentLinks = [
    { href: "/dashboard/agent", label: "My Listings", icon: Building2 },
    { href: "/dashboard/agent/create-listing", label: "Create Listing", icon: PlusCircle },
  ]

  const links = role === "admin" ? adminLinks : agentLinks

  const isActive = (href: string) => {
    if (href === "/dashboard/admin" || href === "/dashboard/agent") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a2332] text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-[#1a2332] text-white transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
               <img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTirZvs6mwvxX4xSRx9pPSYetcWbXdcuqs_o5hVVBk1e_BGdj6Q" width={100} height={100} alt="" />
              </div>
              <div>
                <h1 className="font-bold text-sm">Scarborough</h1>
                <p className="text-xs text-gray-400">Commercial RE</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    active ? "bg-white text-[#1a2332]" : "text-gray-300 hover:bg-gray-700",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <div className="text-sm">
              <p className="text-gray-400">Logged in as</p>
              <p className="font-medium capitalize">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
