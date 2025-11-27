import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const listingId = formData.get("listingId") as string
    const folder = formData.get("folder") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!blobToken) {
      console.error("[v0] BLOB_READ_WRITE_TOKEN not configured")
      return NextResponse.json(
        {
          error: "Blob storage not configured. Please add BLOB_READ_WRITE_TOKEN environment variable.",
          instructions:
            "Go to Vercel Dashboard > Project > Settings > Environment Variables > Add BLOB_READ_WRITE_TOKEN",
        },
        { status: 503 },
      )
    }

    const blob = await put(file.name, file, {
      access: "public",
      token: blobToken,
      addRandomSuffix: true,
      allowOverwrite: true,
    })

    console.log("[v0] File uploaded successfully:", blob.url)

    return NextResponse.json({
      url: blob.url,
      name: file.name,
      size: file.size,
      type: file.type,
      listingId,
      folder,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    )
  }
}
