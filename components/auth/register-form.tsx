"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Auto login after registration
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/dashboard/agent")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">{"Create Account"}</h2>
        <p className="text-muted-foreground">{"Register as an agent to start managing listings"}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="space-y-2">
          <Label htmlFor="fullName">{"Full Name"}</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{"Email Address"}</Label>
          <Input
            id="email"
            type="email"
            placeholder="agent@scarboroughcre.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{"Phone Number"}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="903-827-3112"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{"Password"}</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
            className="h-12"
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">{"Already have an account? "}</span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            {"Sign In"}
          </Link>
        </div>
      </form>
    </div>
  )
}
