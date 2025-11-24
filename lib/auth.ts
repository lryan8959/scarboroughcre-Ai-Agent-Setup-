"use server"

import { getSupabaseServerClient } from "./supabase/server"
import bcrypt from "bcryptjs"

export async function login(email: string, password: string) {
  const supabase = await getSupabaseServerClient()

  // Fetch user by email
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error || !user) {
    return { error: "Invalid credentials" }
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return { error: "Invalid credentials" }
  }

  // Create session (simplified - store user in session)
  return { success: true, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } }
}

export async function register(email: string, password: string, fullName: string, phone: string) {
  const supabase = await getSupabaseServerClient()

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Insert new user (default role: agent)
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
    return { error: error.message }
  }

  return { success: true, user: data }
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient()

  // In a real app, you'd get the user ID from session/cookies
  // For simplicity, we'll return null and handle auth state in client
  return null
}
