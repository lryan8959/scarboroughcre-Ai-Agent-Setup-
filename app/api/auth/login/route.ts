import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const supabase = await getSupabaseServiceClient()

    console.log("[v0] Attempting login for:", email)

    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

    console.log("[v0] User query result:", { found: !!user, error: error?.message })

    if (error || !user) {
      console.log("[v0] User not found or query error")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)

    console.log("[v0] Password comparison result:", isValid)

    if (!isValid) {
      console.log("[v0] Password mismatch")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    console.log("[v0] Login successful for:", email)
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
