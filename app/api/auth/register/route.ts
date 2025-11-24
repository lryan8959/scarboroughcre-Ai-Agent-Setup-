import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone } = await request.json()

    const supabase = await getSupabaseServiceClient()

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        password: hashedPassword,
        full_name: fullName,
        phone,
        role: "agent",
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }
      throw error
    }

    const { password: _, ...userWithoutPassword } = data

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
