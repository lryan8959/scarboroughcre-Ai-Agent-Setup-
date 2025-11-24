import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    const supabase = await getSupabaseServerClient()

    let query = supabase
      .from("listings")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })

    if (agentId) {
      query = query.eq("agent_id", agentId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ listings: data })
  } catch (error) {
    console.error("[v0] Error fetching listings:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.from("listings").insert(body).select().single()

    if (error) throw error

    return NextResponse.json({ listing: data })
  } catch (error) {
    console.error("[v0] Error creating listing:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}
