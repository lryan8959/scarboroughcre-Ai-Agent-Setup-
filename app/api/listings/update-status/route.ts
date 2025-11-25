import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { listingId, status } = await request.json()

    if (!listingId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()
    const { error } = await supabase.from("listings").update({ status }).eq("id", listingId)

    if (error) {
      console.error("[v0] Error updating listing status:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[v0] Listing ${listingId} status updated to ${status}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in update-status route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
