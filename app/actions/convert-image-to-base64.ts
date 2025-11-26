"use server"

export async function convertImageToBase64Server(url: string): Promise<string | null> {
  try {
    console.log("[v0] Server: Converting image to base64:", url)

    let fetchUrl = url
    if (url.startsWith("/")) {
      // For local files, construct full URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      fetchUrl = `${baseUrl}${url}`
      console.log("[v0] Server: Converted local path to:", fetchUrl)
    }

    const response = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NextJS/14.0)",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Server: Failed to fetch image: ${response.statusText}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")

    // Determine mime type
    const contentType = response.headers.get("content-type") || "image/jpeg"

    const dataUrl = `data:${contentType};base64,${base64}`
    console.log("[v0] Server: Image converted successfully")

    return dataUrl
  } catch (error) {
    console.error("[v0] Server: Error converting image:", error)
    return null
  }
}
