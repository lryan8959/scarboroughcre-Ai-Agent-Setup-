import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId } = body

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 })
    }

    const supabase = await getSupabaseServiceClient()

    // First delete associated files
    const { error: filesError } = await supabase.from("listing_files").delete().eq("listing_id", listingId)

    if (filesError) {
      console.error("[v0] Error deleting listing files:", filesError)
    }

    // Then delete the listing
    const { error } = await supabase.from("listings").delete().eq("id", listingId)

    if (error) {
      console.error("[v0] Error deleting listing:", error)
      throw error
    }

    console.log(`[v0] Listing ${listingId} deleted successfully`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting listing:", error)
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 })
  }
}
