"use client"

import { CompanyLogo } from "@/components/company-logo"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  user: {
    full_name: string
    email: string
    role: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <CompanyLogo />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium">{user.full_name}</p>
              <p className="text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
