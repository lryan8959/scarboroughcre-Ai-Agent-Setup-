"use server"

import { getSupabaseServiceClient } from "@/lib/supabase/server"

export async function getListingById(listingId: string) {
  try {
    const supabase = getSupabaseServiceClient()

    const { data: listing, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        categories (name),
        users (full_name, email, role)
      `,
      )
      .eq("id", listingId)
      .single()

    if (error) {
      console.error("[v0] Error fetching listing:", error)
      return { data: null, error: error.message }
    }

    // Fetch all files for this listing
    const { data: files, error: filesError } = await supabase
      .from("listing_files")
      .select("*")
      .eq("listing_id", listingId)
      .order("folder_name")

    if (filesError) {
      console.error("[v0] Error fetching files:", filesError)
    }

    console.log(`[v0] Listing fetched successfully: ${listing.address}`)
    return { data: { ...listing, files: files || [] }, error: null }
  } catch (error: any) {
    console.error("[v0] Error in getListingById:", error)
    return { data: null, error: error.message }
  }
}
