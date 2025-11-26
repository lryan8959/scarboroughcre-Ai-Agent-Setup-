"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SocialMediaPostGeneratorProps {
  listing: any
}

const THEMES = [
  {
    name: "Classic Blue",
    overlay: "rgba(30, 41, 59, 0.80)",
    gradient: ["#1e293b", "#334155"],
    accent: "#3b82f6",
  },
  {
    name: "Emerald Green",
    overlay: "rgba(6, 78, 59, 0.80)",
    gradient: ["#064e3b", "#065f46"],
    accent: "#10b981",
  },
  {
    name: "Amber Orange",
    overlay: "rgba(120, 53, 15, 0.80)",
    gradient: ["#78350f", "#92400e"],
    accent: "#f59e0b",
  },
  {
    name: "Slate Gray",
    overlay: "rgba(15, 23, 42, 0.80)",
    gradient: ["#0f172a", "#1e293b"],
    accent: "#64748b",
  },
]

export function SocialMediaPostGenerator({ listing }: SocialMediaPostGeneratorProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedTheme, setSelectedTheme] = useState(0)

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = ctx.measureText(currentLine + " " + word).width
      if (width < maxWidth) {
        currentLine += " " + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  const generatePost = async (themeIndex: number) => {
    const theme = THEMES[themeIndex]

    try {
      const canvas = canvasRefs.current[themeIndex]
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 1080
      canvas.height = 1080

      // Load background image if available
      let backgroundImg: HTMLImageElement | null = null
      if (listing.thumbnail_url) {
        backgroundImg = await loadImage(listing.thumbnail_url)
      }

      let logoImg: HTMLImageElement | null = null
      try {
        logoImg = await loadImage(
          "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTirZvs6mwvxX4xSRx9pPSYetcWbXdcuqs_o5hVVBk1e_BGdj6Q",
        )
      } catch (error) {
        console.log("[v0] Logo loading failed, will skip logo")
      }

      // Route to different layout functions based on theme
      if (themeIndex === 0) {
        await drawClassicLayout(ctx, canvas, backgroundImg, logoImg, theme)
      } else if (themeIndex === 1) {
        await drawSplitScreenLayout(ctx, canvas, backgroundImg, logoImg, theme)
      } else if (themeIndex === 2) {
        await drawMinimalistLayout(ctx, canvas, backgroundImg, logoImg, theme)
      } else {
        await drawBoldModernLayout(ctx, canvas, backgroundImg, logoImg, theme)
      }

      // Generate preview
      const dataUrl = canvas.toDataURL("image/png")
      return dataUrl
    } catch (error) {
      console.error("[v0] Error generating social media post:", error)
      return null
    }
  }

  const drawClassicLayout = async (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    backgroundImg: HTMLImageElement | null,
    logoImg: HTMLImageElement | null,
    theme: (typeof THEMES)[0],
  ) => {
    // Draw background with overlay
    if (backgroundImg) {
      const scale = Math.max(canvas.width / backgroundImg.width, canvas.height / backgroundImg.height)
      const x = (canvas.width - backgroundImg.width * scale) / 2
      const y = (canvas.height - backgroundImg.height * scale) / 2
      ctx.drawImage(backgroundImg, x, y, backgroundImg.width * scale, backgroundImg.height * scale)

      ctx.fillStyle = theme.overlay
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, theme.gradient[0])
      gradient.addColorStop(1, theme.gradient[1])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Add diagonal lines pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
    ctx.lineWidth = 2
    for (let i = -canvas.height; i < canvas.width; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + canvas.height, canvas.height)
      ctx.stroke()
    }

    const listingTypeText =
      listing.listing_type === "for_sale"
        ? "For Sale"
        : listing.listing_type === "for_lease"
          ? "For Lease"
          : "For Sale or Lease"

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 80px sans-serif"
    ctx.fillText(listingTypeText, 80, 140)

    const descriptionText = listing.categories?.name || listing.property_type || "Commercial Property"
    ctx.font = "italic 42px sans-serif"
    ctx.fillText(descriptionText, 80, 200)

    if (backgroundImg && listing.thumbnail_url) {
      const imgY = 280
      const imgHeight = 380
      const imgWidth = 920
      const imgX = 80

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(imgX - 10, imgY - 10, imgWidth + 20, imgHeight + 20)

      const imgScale = Math.max(imgWidth / backgroundImg.width, imgHeight / backgroundImg.height)
      const imgScaledW = backgroundImg.width * imgScale
      const imgScaledH = backgroundImg.height * imgScale
      const imgOffsetX = imgX + (imgWidth - imgScaledW) / 2
      const imgOffsetY = imgY + (imgHeight - imgScaledH) / 2

      ctx.save()
      ctx.beginPath()
      ctx.rect(imgX, imgY, imgWidth, imgHeight)
      ctx.clip()
      ctx.drawImage(backgroundImg, imgOffsetX, imgOffsetY, imgScaledW, imgScaledH)
      ctx.restore()
    }

    const detailsY = backgroundImg ? 720 : 400

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 48px sans-serif"

    const addressText = `${listing.address} | ${listing.city}, ${listing.state} ${listing.zip_code}`
    const addressLines = wrapText(ctx, addressText, 920)

    addressLines.forEach((line, index) => {
      ctx.fillText(line, 80, detailsY + index * 60)
    })

    const priceY = detailsY + addressLines.length * 60 + 40
    const priceText = `Asking $${listing.list_price?.toLocaleString()}`
    ctx.font = "bold 52px sans-serif"
    ctx.fillText(priceText, 80, priceY)

    const contactY = priceY + 100

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px sans-serif"
    ctx.fillText("CONTACT: Sam Scarborough", 80, contactY)

    ctx.font = "24px sans-serif"
    ctx.fillText("sam@scarboroughcre.com", 80, contactY + 40)
    ctx.fillText("(M): 903.570.7366", 80, contactY + 75)
    ctx.fillText("(O): 903.707.8560", 80, contactY + 110)
    ctx.fillText("www.scarboroughcre.com", 80, contactY + 145)

    if (logoImg) {
      const logoWidth = 200
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth
      const logoX = canvas.width - logoWidth - 80
      const logoY = canvas.height - logoHeight - 60

      ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight)
    }
  }

  const drawSplitScreenLayout = async (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    backgroundImg: HTMLImageElement | null,
    logoImg: HTMLImageElement | null,
    theme: (typeof THEMES)[0],
  ) => {
    // Split canvas: left side image, right side info
    const splitX = canvas.width / 2

    // Left side - Image
    if (backgroundImg) {
      const imgScale = Math.max(splitX / backgroundImg.width, canvas.height / backgroundImg.height)
      const imgW = backgroundImg.width * imgScale
      const imgH = backgroundImg.height * imgScale
      const imgX = (splitX - imgW) / 2
      const imgY = (canvas.height - imgH) / 2

      ctx.drawImage(backgroundImg, imgX, imgY, imgW, imgH)

      // Overlay on left side
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.fillRect(0, 0, splitX, canvas.height)
    } else {
      ctx.fillStyle = theme.gradient[0]
      ctx.fillRect(0, 0, splitX, canvas.height)
    }

    // Right side - Solid color background
    const gradient = ctx.createLinearGradient(splitX, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, theme.gradient[0])
    gradient.addColorStop(1, theme.gradient[1])
    ctx.fillStyle = gradient
    ctx.fillRect(splitX, 0, canvas.width - splitX, canvas.height)

    // Vertical accent bar
    ctx.fillStyle = theme.accent
    ctx.fillRect(splitX - 8, 0, 8, canvas.height)

    // Content on right side
    const contentX = splitX + 60
    let currentY = 120

    // Listing type
    const listingTypeText =
      listing.listing_type === "for_sale"
        ? "FOR SALE"
        : listing.listing_type === "for_lease"
          ? "FOR LEASE"
          : "FOR SALE OR LEASE"

    ctx.fillStyle = theme.accent
    ctx.font = "bold 50px sans-serif"
    ctx.fillText(listingTypeText, contentX, currentY)
    currentY += 80

    // Category badge
    const categoryText = (listing.categories?.name || listing.property_type || "Commercial").toUpperCase()
    ctx.fillStyle = theme.accent
    ctx.fillRect(contentX, currentY - 35, ctx.measureText(categoryText).width + 40, 50)
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 24px sans-serif"
    ctx.fillText(categoryText, contentX + 20, currentY - 7)
    currentY += 100

    // Address
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 32px sans-serif"
    const addressLines = wrapText(ctx, listing.address, 420)
    addressLines.forEach((line) => {
      ctx.fillText(line, contentX, currentY)
      currentY += 45
    })
    currentY += 10

    // City, State
    ctx.font = "28px sans-serif"
    ctx.fillText(`${listing.city}, ${listing.state} ${listing.zip_code}`, contentX, currentY)
    currentY += 100

    // Price - Large and prominent
    ctx.fillStyle = theme.accent
    ctx.font = "bold 60px sans-serif"
    ctx.fillText("$" + listing.list_price?.toLocaleString(), contentX, currentY)
    currentY += 80

    // Divider line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(contentX, currentY)
    ctx.lineTo(canvas.width - 60, currentY)
    ctx.stroke()
    currentY += 60

    // Contact info
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 22px sans-serif"
    ctx.fillText("Sam Scarborough", contentX, currentY)
    currentY += 35

    ctx.font = "20px sans-serif"
    ctx.fillText("sam@scarboroughcre.com", contentX, currentY)
    currentY += 30
    ctx.fillText("M: 903.570.7366", contentX, currentY)
    currentY += 30
    ctx.fillText("O: 903.707.8560", contentX, currentY)
    currentY += 30
    ctx.fillText("www.scarboroughcre.com", contentX, currentY)

    // Logo at bottom right
    if (logoImg) {
      const logoWidth = 150
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth
      ctx.drawImage(logoImg, canvas.width - logoWidth - 40, canvas.height - logoHeight - 40, logoWidth, logoHeight)
    }
  }

  const drawMinimalistLayout = async (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    backgroundImg: HTMLImageElement | null,
    logoImg: HTMLImageElement | null,
    theme: (typeof THEMES)[0],
  ) => {
    // Full background image with dark overlay
    if (backgroundImg) {
      const scale = Math.max(canvas.width / backgroundImg.width, canvas.height / backgroundImg.height)
      const x = (canvas.width - backgroundImg.width * scale) / 2
      const y = (canvas.height - backgroundImg.height * scale) / 2
      ctx.drawImage(backgroundImg, x, y, backgroundImg.width * scale, backgroundImg.height * scale)

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      ctx.fillStyle = theme.gradient[0]
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Center white card
    const cardWidth = 800
    const cardHeight = 720
    const cardX = (canvas.width - cardWidth) / 2
    const cardY = (canvas.height - cardHeight) / 2

    ctx.fillStyle = "#ffffff"
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    ctx.shadowBlur = 40
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight)
    ctx.shadowBlur = 0

    // Content inside card
    const centerX = canvas.width / 2
    let currentY = cardY + 80

    // Listing type
    const listingTypeText =
      listing.listing_type === "for_sale"
        ? "FOR SALE"
        : listing.listing_type === "for_lease"
          ? "FOR LEASE"
          : "FOR SALE OR LEASE"

    ctx.fillStyle = theme.gradient[0]
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(listingTypeText, centerX, currentY)
    currentY += 60

    // Thin accent line
    ctx.fillStyle = theme.accent
    ctx.fillRect(centerX - 100, currentY, 200, 4)
    currentY += 60

    // Address
    ctx.fillStyle = "#1a1a1a"
    ctx.font = "bold 36px sans-serif"
    const addressLines = wrapText(ctx, listing.address, 700)
    addressLines.forEach((line) => {
      ctx.fillText(line, centerX, currentY)
      currentY += 50
    })

    ctx.font = "28px sans-serif"
    ctx.fillText(`${listing.city}, ${listing.state} ${listing.zip_code}`, centerX, currentY)
    currentY += 80

    // Category
    ctx.fillStyle = "#666"
    ctx.font = "24px sans-serif"
    ctx.fillText(listing.categories?.name || listing.property_type || "Commercial Property", centerX, currentY)
    currentY += 80

    // Price - Large
    ctx.fillStyle = theme.accent
    ctx.font = "bold 64px sans-serif"
    ctx.fillText("$" + listing.list_price?.toLocaleString(), centerX, currentY)
    currentY += 80

    // Contact
    ctx.fillStyle = "#333"
    ctx.font = "bold 20px sans-serif"
    ctx.fillText("Sam Scarborough", centerX, currentY)
    currentY += 30

    ctx.font = "18px sans-serif"
    ctx.fillText("sam@scarboroughcre.com | 903.570.7366", centerX, currentY)
    currentY += 25
    ctx.fillText("www.scarboroughcre.com", centerX, currentY)

    // Logo at top right of card
    if (logoImg) {
      const logoWidth = 120
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth
      ctx.drawImage(logoImg, cardX + cardWidth - logoWidth - 30, cardY + 30, logoWidth, logoHeight)
    }

    ctx.textAlign = "left"
  }

  const drawBoldModernLayout = async (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    backgroundImg: HTMLImageElement | null,
    logoImg: HTMLImageElement | null,
    theme: (typeof THEMES)[0],
  ) => {
    // Top half - Image banner
    const bannerHeight = 500

    if (backgroundImg) {
      const imgScale = Math.max(canvas.width / backgroundImg.width, bannerHeight / backgroundImg.height)
      const imgW = backgroundImg.width * imgScale
      const imgH = backgroundImg.height * imgScale
      const imgX = (canvas.width - imgW) / 2
      const imgY = (bannerHeight - imgH) / 2

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, canvas.width, bannerHeight)
      ctx.clip()
      ctx.drawImage(backgroundImg, imgX, imgY, imgW, imgH)
      ctx.restore()

      // Gradient overlay on image
      const imgGradient = ctx.createLinearGradient(0, 0, 0, bannerHeight)
      imgGradient.addColorStop(0, "rgba(0, 0, 0, 0.3)")
      imgGradient.addColorStop(1, "rgba(0, 0, 0, 0.6)")
      ctx.fillStyle = imgGradient
      ctx.fillRect(0, 0, canvas.width, bannerHeight)
    } else {
      ctx.fillStyle = theme.gradient[0]
      ctx.fillRect(0, 0, canvas.width, bannerHeight)
    }

    // Listing type badge on image
    const listingTypeText =
      listing.listing_type === "for_sale"
        ? "FOR SALE"
        : listing.listing_type === "for_lease"
          ? "FOR LEASE"
          : "FOR SALE / LEASE"

    ctx.fillStyle = theme.accent
    const badgePadding = 40
    const badgeWidth = ctx.measureText(listingTypeText).width + badgePadding * 2
    ctx.font = "bold 36px sans-serif"
    ctx.fillRect(60, 60, badgeWidth, 60)

    ctx.fillStyle = "#ffffff"
    ctx.fillText(listingTypeText, 60 + badgePadding, 60 + 43)

    // Bottom half - Dark background with info
    const gradient = ctx.createLinearGradient(0, bannerHeight, 0, canvas.height)
    gradient.addColorStop(0, theme.gradient[0])
    gradient.addColorStop(1, theme.gradient[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, bannerHeight, canvas.width, canvas.height - bannerHeight)

    // Angled accent bar
    ctx.fillStyle = theme.accent
    ctx.beginPath()
    ctx.moveTo(0, bannerHeight)
    ctx.lineTo(canvas.width, bannerHeight)
    ctx.lineTo(canvas.width, bannerHeight + 12)
    ctx.lineTo(0, bannerHeight + 20)
    ctx.closePath()
    ctx.fill()

    // Content section
    let currentY = bannerHeight + 80

    // Price - Very prominent
    ctx.fillStyle = theme.accent
    ctx.font = "bold 72px sans-serif"
    ctx.fillText("$" + listing.list_price?.toLocaleString(), 80, currentY)
    currentY += 90

    // Address
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 40px sans-serif"
    const addressLines = wrapText(ctx, listing.address, 920)
    addressLines.forEach((line) => {
      ctx.fillText(line, 80, currentY)
      currentY += 55
    })

    ctx.font = "32px sans-serif"
    ctx.fillText(`${listing.city}, ${listing.state} ${listing.zip_code}`, 80, currentY)
    currentY += 60

    // Category pill
    const categoryText = (listing.categories?.name || listing.property_type || "Commercial").toUpperCase()
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
    ctx.fillRect(80, currentY - 28, ctx.measureText(categoryText).width + 30, 40)
    ctx.fillStyle = "#ffffff"
    ctx.font = "20px sans-serif"
    ctx.fillText(categoryText, 95, currentY - 4)
    currentY += 80

    // Contact section with background
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(0, currentY - 20, canvas.width, 140)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 24px sans-serif"
    ctx.fillText("CONTACT", 80, currentY + 15)

    ctx.font = "22px sans-serif"
    ctx.fillText("Sam Scarborough", 80, currentY + 50)
    ctx.fillText("sam@scarboroughcre.com", 80, currentY + 80)
    ctx.fillText("M: 903.570.7366  |  O: 903.707.8560", 450, currentY + 50)
    ctx.fillText("www.scarboroughcre.com", 450, currentY + 80)

    // Logo
    if (logoImg) {
      const logoWidth = 180
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth
      ctx.drawImage(logoImg, canvas.width - logoWidth - 60, currentY - 10, logoWidth, logoHeight)
    }
  }

  const generateAllPosts = async () => {
    setIsGenerating(true)

    try {
      const urls = await Promise.all(THEMES.map((_, index) => generatePost(index)))
      setPreviewUrls(urls.filter((url): url is string => url !== null))
    } catch (error) {
      console.error("[v0] Error generating posts:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  const downloadPost = (index: number) => {
    const previewUrl = previewUrls[index]
    if (!previewUrl) return

    const link = document.createElement("a")
    link.download = `${listing.address.replace(/[^a-z0-9]/gi, "_")}_${THEMES[index].name.replace(/\s+/g, "_")}.png`
    link.href = previewUrl
    link.click()
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && previewUrls.length === 0) {
      setTimeout(() => generateAllPosts(), 100)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white bg-transparent"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Generate Social Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Social Media Post Templates</DialogTitle>
          <DialogDescription>Choose a template and download your property listing social media post</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hidden canvases */}
          {THEMES.map((_, index) => (
            <canvas
              key={index}
              ref={(el) => {
                canvasRefs.current[index] = el
              }}
              className="hidden"
            />
          ))}

          {/* Preview */}
          {isGenerating ? (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#2563eb]" />
                <p className="text-sm text-gray-600">Generating your templates...</p>
              </div>
            </div>
          ) : previewUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {previewUrls.map((url, index) => (
                <div key={index} className="space-y-3">
                  <div
                    className={cn(
                      "relative cursor-pointer rounded-lg border-2 transition-all overflow-hidden",
                      selectedTheme === index ? "border-[#2563eb] shadow-lg" : "border-gray-200 hover:border-gray-300",
                    )}
                    onClick={() => setSelectedTheme(index)}
                  >
                    <img src={url || "/placeholder.svg"} alt={`${THEMES[index].name} template`} className="w-full" />
                    {selectedTheme === index && (
                      <div className="absolute top-2 right-2 bg-[#2563eb] text-white px-3 py-1 rounded-full text-sm font-medium">
                        Selected
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{THEMES[index].name}</p>
                    <Button size="sm" onClick={() => downloadPost(index)} className="bg-[#2563eb] hover:bg-[#1d4ed8]">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-500">No preview available</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
