"use server"

import { getSupabaseServiceClient } from "@/lib/supabase/server"

export async function getListingImagesForPDF(listingId: string) {
  try {
    const supabase = getSupabaseServiceClient()

    const { data: files, error: filesError } = await supabase
      .from("listing_files")
      .select("*")
      .eq("listing_id", listingId)
      .order("uploaded_at")

    if (filesError) {
      console.error("[v0] Error fetching files:", filesError)
      return { images: [], error: filesError.message }
    }

    if (!files || files.length === 0) {
      console.log("[v0] No files found for listing")
      return { images: [], error: null }
    }

    const imageFiles = files.filter((file) => {
      const isImage = file.file_type?.startsWith("image/") || file.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      return isImage && file.file_url
    })

    console.log(`[v0] Found ${imageFiles.length} image files for listing ${listingId}`)

    const imagePromises = imageFiles.map(async (file) => {
      try {
        console.log(`[v0] Fetching image: ${file.file_url}`)
        const response = await fetch(file.file_url)

        if (!response.ok) {
          console.error(`[v0] Failed to fetch image: ${response.status}`)
          return null
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString("base64")
        const mimeType = file.file_type || "image/jpeg"
        const dataUrl = `data:${mimeType};base64,${base64}`

        console.log(`[v0] Successfully converted image to base64: ${file.file_name}`)
        return {
          dataUrl,
          fileName: file.file_name,
          fileType: mimeType,
        }
      } catch (error) {
        console.error(`[v0] Error fetching image ${file.file_url}:`, error)
        return null
      }
    })

    const results = await Promise.all(imagePromises)
    const successfulImages = results.filter((img) => img !== null)

    console.log(`[v0] Successfully loaded ${successfulImages.length} images for PDF`)
    return { images: successfulImages, error: null }
  } catch (error: any) {
    console.error("[v0] Error in getListingImagesForPDF:", error)
    return { images: [], error: error.message }
  }
}
