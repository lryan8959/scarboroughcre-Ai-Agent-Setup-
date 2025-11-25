"use server"

import { getSupabaseServiceClient } from "@/lib/supabase/server"
import { getListingById as getListingByIdFromAction } from "./get-listing"

export async function createListing(listingData: any) {
  try {
    const supabase = await getSupabaseServiceClient()

    // Insert listing with service role client (bypasses RLS)
    const { data: listing, error: listingError } = await supabase.from("listings").insert(listingData).select().single()

    if (listingError) {
      console.error("[v0] Listing creation error:", {
        message: listingError.message,
        details: listingError.details,
        hint: listingError.hint,
        code: listingError.code,
      })
      return { error: listingError.message }
    }

    return { data: listing.id }
  } catch (error: any) {
    console.error("[v0] Server action error:", error)
    return { error: error.message || "Failed to create listing" }
  }
}

export async function saveListingFile(fileData: any) {
  try {
    const supabase = await getSupabaseServiceClient()

    // Insert file metadata with service role client (bypasses RLS)
    const { error: fileError } = await supabase.from("listing_files").insert(fileData)

    if (fileError) {
      console.error("[v0] File save error:", fileError)
      return { error: fileError.message }
    }

    return { error: null }
  } catch (error: any) {
    console.error("[v0] Server action error:", error)
    return { error: error.message || "Failed to save file" }
  }
}

export async function saveListingFiles(fileData: any) {
  return await saveListingFile(fileData)
}

export async function updateListingThumbnail(listingId: string, thumbnailUrl: string) {
  try {
    const supabase = await getSupabaseServiceClient()

    const { error } = await supabase.from("listings").update({ thumbnail_url: thumbnailUrl }).eq("id", listingId)

    if (error) {
      console.error("[v0] Thumbnail update error:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Server action error:", error)
    return { error: error.message || "Failed to update thumbnail" }
  }
}

export async function updateThumbnail(listingId: string, thumbnailUrl: string) {
  return await updateListingThumbnail(listingId, thumbnailUrl)
}

export async function updateListing(listingId: string, listingData: any) {
  try {
    const supabase = await getSupabaseServiceClient()

    // Update listing with service role client (bypasses RLS)
    const { error: listingError } = await supabase.from("listings").update(listingData).eq("id", listingId)

    if (listingError) {
      console.error("[v0] Listing update error:", {
        message: listingError.message,
        details: listingError.details,
        hint: listingError.hint,
        code: listingError.code,
      })
      return { error: listingError.message }
    }

    return { data: listingId }
  } catch (error: any) {
    console.error("[v0] Server action error:", error)
    return { error: error.message || "Failed to update listing" }
  }
}

export async function deleteListingFile(fileId: string) {
  try {
    const supabase = await getSupabaseServiceClient()

    const { error } = await supabase.from("listing_files").delete().eq("id", fileId)

    if (error) {
      console.error("[v0] File delete error:", error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error: any) {
    console.error("[v0] Server action error:", error)
    return { error: error.message || "Failed to delete file" }
  }
}

export { getListingByIdFromAction as getListingById }
