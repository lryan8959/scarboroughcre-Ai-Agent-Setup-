"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Download, Loader2 } from "lucide-react"
import { jsPDF } from "jspdf"
import { getListingImagesForPDF } from "@/app/actions/get-listing-images-for-pdf"

interface OMGeneratorProps {
  listing: any
}

const loadImageViaFetch = async (url: string): Promise<string> => {
  try {
    console.log("[v0] Fetching image via fetch API:", url)

    // Fetch the image
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Convert to blob
    const blob = await response.blob()

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        console.log("[v0] Image converted to base64 successfully:", url.substring(0, 50))
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("[v0] Fetch method failed:", error)

    // Fallback to canvas method
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            const dataURL = canvas.toDataURL("image/jpeg", 0.85)
            console.log("[v0] Image loaded via canvas fallback")
            resolve(dataURL)
          } else {
            reject(new Error("Failed to get canvas context"))
          }
        } catch (error) {
          console.error("[v0] Canvas conversion failed:", error)
          reject(error)
        }
      }

      img.onerror = (error) => {
        console.error("[v0] Image load failed completely:", url, error)
        reject(new Error(`Failed to load image: ${url}`))
      }

      img.src = url
    })
  }
}

export function OMMemorandumGenerator({ listing }: OMGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  const generatePDF = async () => {
    setGenerating(true)

    try {
      console.log("[v0] Starting PDF generation for listing:", listing.id)
      console.log("[v0] Listing files:", listing.files)

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 40

      const drawTriangle = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
        pdf.lines(
          [
            [x2 - x1, y2 - y1],
            [x3 - x2, y3 - y2],
            [x1 - x3, y1 - y3],
          ],
          x1,
          y1,
          [1, 1],
          "F",
        )
      }

      // PAGE 1: Cover Page
      pdf.setFillColor(30, 41, 59)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      try {
        const logoBase64 = await loadImageViaFetch(
          "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTirZvs6mwvxX4xSRx9pPSYetcWbXdcuqs_o5hVVBk1e_BGdj6Q",
        )
        const logoWidth = 120
        const logoHeight = 40
        pdf.addImage(logoBase64, "PNG", (pageWidth - logoWidth) / 2, 40, logoWidth, logoHeight)
      } catch (error) {
        console.error("[v0] Failed to load logo:", error)
      }

      // Property Image with white border
      if (listing.thumbnail_url) {
        try {
          const propBase64 = await loadImageViaFetch(listing.thumbnail_url)
          const imgWidth = pageWidth - 2 * margin
          const imgHeight = 300
          const imgY = 120

          pdf.setFillColor(255, 255, 255)
          pdf.rect(margin - 5, imgY - 5, imgWidth + 10, imgHeight + 10, "F")
          pdf.addImage(propBase64, "JPEG", margin, imgY, imgWidth, imgHeight)
        } catch (error) {
          console.error("[v0] Failed to load property image:", error)
        }
      }

      // Diagonal triangle design
      pdf.setFillColor(248, 250, 252)
      const triangleY = 440
      drawTriangle(0, triangleY, pageWidth, triangleY, pageWidth, pageHeight)

      pdf.setTextColor(30, 41, 59)
      pdf.setFontSize(48)
      pdf.setFont("helvetica", "bold")
      const listingTypeText =
        listing.listing_type === "for_sale"
          ? "FOR SALE"
          : listing.listing_type === "for_lease"
            ? "FOR LEASE"
            : "FOR SALE OR LEASE"
      pdf.text(listingTypeText, pageWidth / 2, 500, { align: "center" })

      pdf.setTextColor(51, 65, 85)
      pdf.setFontSize(16)
      pdf.setFont("helvetica", "normal")
      const detailsLine1 = `${listing.building_sf ? listing.building_sf.toLocaleString() + " SF" : ""} ${listing.categories?.name || ""}`
      pdf.text(detailsLine1.trim(), pageWidth / 2, 535, { align: "center" })

      const addressLine = `${listing.address} | ${listing.city}, ${listing.state} ${listing.zip_code}`
      pdf.setFontSize(14)
      pdf.text(addressLine, pageWidth / 2, 560, { align: "center" })

      // Key stats boxes at bottom
      const boxY = 620
      const boxWidth = (pageWidth - 3 * margin) / 3
      const boxHeight = 80

      // Property Size Box
      pdf.setFillColor(255, 255, 255)
      pdf.rect(margin, boxY, boxWidth, boxHeight, "F")
      pdf.setTextColor(71, 85, 105)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.text("PROPERTY SIZE", margin + boxWidth / 2, boxY + 20, { align: "center" })
      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(18)
      const propSize = listing.lot_acres
        ? `${listing.lot_acres} ACRES`
        : `${listing.building_sf?.toLocaleString() || "N/A"} SF`
      pdf.text(propSize, margin + boxWidth / 2, boxY + 50, { align: "center" })

      // Traffic Count Box
      const trafficX = margin + boxWidth + margin / 2
      pdf.setFillColor(255, 255, 255)
      pdf.rect(trafficX, boxY, boxWidth, boxHeight, "F")
      pdf.setTextColor(71, 85, 105)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.text("TRAFFIC COUNT", trafficX + boxWidth / 2, boxY + 20, { align: "center" })
      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(18)
      const trafficCount = listing.custom_fields?.traffic_count || "N/A"
      pdf.text(trafficCount, trafficX + boxWidth / 2, boxY + 50, { align: "center" })

      // Pricing Box
      const priceX = trafficX + boxWidth + margin / 2
      pdf.setFillColor(255, 255, 255)
      pdf.rect(priceX, boxY, boxWidth, boxHeight, "F")
      pdf.setTextColor(71, 85, 105)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.text("PRICING", priceX + boxWidth / 2, boxY + 20, { align: "center" })
      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(18)
      pdf.text(`$${listing.list_price?.toLocaleString() || "N/A"}`, priceX + boxWidth / 2, boxY + 50, {
        align: "center",
      })

      // PAGE 2: Investment Summary
      pdf.addPage()
      pdf.setFillColor(248, 250, 252)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      // Header
      pdf.setFillColor(30, 58, 95)
      pdf.rect(0, 0, pageWidth, 100, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(32)
      pdf.setFont("helvetica", "bold")
      pdf.text("INVESTMENT SUMMARY", pageWidth / 2, 60, { align: "center" })

      // Three stats boxes
      const statsY = 130
      const statsBoxW = 160
      const statsBoxH = 120
      const statsSpacing = (pageWidth - 3 * statsBoxW - 2 * margin) / 2

      // Property Size
      pdf.setFillColor(255, 255, 255)
      pdf.rect(margin, statsY, statsBoxW, statsBoxH, "F")
      pdf.setTextColor(71, 85, 105)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.text("PROPERTY SIZE", margin + statsBoxW / 2, statsY + 25, { align: "center" })
      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(20)
      pdf.text(propSize, margin + statsBoxW / 2, statsY + 70, { align: "center" })

      // Traffic Count
      const stats2X = margin + statsBoxW + statsSpacing
      pdf.setFillColor(255, 255, 255)
      pdf.rect(stats2X, statsY, statsBoxW, statsBoxH, "F")
      pdf.setTextColor(71, 85, 105)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.text("TRAFFIC COUNT", stats2X + statsBoxW / 2, statsY + 25, { align: "center" })
      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(20)
      pdf.text(trafficCount, stats2X + statsBoxW / 2, statsY + 70, { align: "center" })

      // Pricing
      const stats3X = stats2X + statsBoxW + statsSpacing
      pdf.setFillColor(255, 255, 255)
      pdf.rect(stats3X, statsY, statsBoxW, statsBoxH, "F")
      pdf.setTextColor(71, 85, 105)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.text("PRICING", stats3X + statsBoxW / 2, statsY + 25, { align: "center" })
      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(20)
      pdf.text(`$${listing.list_price?.toLocaleString() || "N/A"}`, stats3X + statsBoxW / 2, statsY + 70, {
        align: "center",
      })

      // Investment Details Section
      let yPos = 280
      pdf.setTextColor(30, 41, 59)
      pdf.setFontSize(16)
      pdf.setFont("helvetica", "bold")
      pdf.text("INVESTMENT DETAILS:", margin, yPos)

      yPos += 30

      // Two columns
      const colWidth = (pageWidth - 3 * margin) / 2

      // Property Overview (left column)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("Property Overview:", margin, yPos)

      yPos += 20
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(51, 65, 85)

      if (listing.description) {
        const lines = pdf.splitTextToSize(listing.description, colWidth - 10)
        pdf.text(lines.slice(0, 15), margin, yPos)
      }

      // Property Features (right column)
      const rightColX = margin + colWidth + margin
      yPos = 310
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(30, 41, 59)
      pdf.text("Property Features:", rightColX, yPos)

      yPos += 20
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(51, 65, 85)

      const features = [
        `Pricing: $${listing.list_price?.toLocaleString() || "N/A"}`,
        `Property size: ${listing.lot_acres ? listing.lot_acres + " acres" : ""}`,
        `Building: ${listing.building_sf ? listing.building_sf.toLocaleString() + " SF" : "N/A"}`,
        `Traffic count: ${trafficCount}`,
        `Utilities: ${listing.custom_fields?.utilities || "Available"}`,
        `Zoning: ${listing.zoning || "N/A"}`,
        `Year Built: ${listing.year_built || "N/A"}`,
      ]

      features.forEach((feature) => {
        pdf.text(`• ${feature}`, rightColX, yPos)
        yPos += 18
      })

      // PAGE 3: Investment Highlights with Samuel's Image
      pdf.addPage()
      pdf.setFillColor(30, 41, 59)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      // Investment Highlights Header
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.setFont("helvetica", "bold")
      pdf.text("INVESTMENT HIGHLIGHTS:", margin, 60)

      // Highlights list
      yPos = 100
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "normal")

      const highlights = [
        `High-visibility location in ${listing.city}, ${listing.state}`,
        `Prime ${listing.categories?.name || "commercial"} property`,
        `${listing.building_sf ? listing.building_sf.toLocaleString() + " SF" : ""} of space`,
        `Zoned ${listing.zoning || "for commercial use"}`,
        `Excellent investment opportunity`,
        `Strong market presence`,
      ]

      highlights.forEach((highlight) => {
        pdf.text(`• ${highlight}`, margin + 20, yPos)
        yPos += 25
      })

      // Diagonal triangle design
      pdf.setFillColor(0, 0, 0)
      const diagY = 320
      drawTriangle(0, diagY, pageWidth, diagY - 80, pageWidth, pageHeight)

      try {
        const samuelBase64 = await loadImageViaFetch("/images/samuel-scarborough.jpg")
        const samImgW = 150
        const samImgH = 180
        const samImgX = margin + 40
        const samImgY = pageHeight - samImgH - 100

        pdf.addImage(samuelBase64, "JPEG", samImgX, samImgY, samImgW, samImgH)
        console.log("[v0] Samuel's image added successfully")
      } catch (error) {
        console.error("[v0] Failed to load Samuel's image:", error)
      }

      // Contact info on the right
      const contactX = pageWidth - margin - 240
      const contactY = pageHeight - margin - 140

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("INVESTMENT CONTACT:", contactX, contactY)

      pdf.setFontSize(13)
      pdf.text("Samuel Scarborough, CCIM", contactX, contactY + 26)

      pdf.setFontSize(11)
      pdf.setFont("helvetica", "normal")
      pdf.text("Broker/President", contactX, contactY + 46)
      pdf.text("(903) 570-7366", contactX, contactY + 66)
      pdf.text("www.scarboroughcre.com", contactX, contactY + 86)

      console.log("[v0] Checking listing files:", listing.files)
      console.log("[v0] Total files count:", listing.files?.length || 0)

      console.log("[v0] Fetching property images from server...")
      const { images: propertyImages, error: imagesError } = await getListingImagesForPDF(listing.id)

      if (imagesError) {
        console.error("[v0] Error fetching property images:", imagesError)
      }

      console.log(`[v0] Property images result:`, {
        count: propertyImages?.length || 0,
        hasImages: !!propertyImages && propertyImages.length > 0,
        error: imagesError,
      })

      // PAGE 4: Property Images
      pdf.addPage()
      pdf.setFillColor(0, 0, 0)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      // Header
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(28)
      pdf.setFont("helvetica", "bold")
      pdf.text("PROPERTY IMAGES", pageWidth / 2, 70, { align: "center" })

      if (propertyImages && propertyImages.length > 0) {
        let currentY = 120

        // First image full width (hero image)
        const firstImg = propertyImages[0]
        if (firstImg && firstImg.dataUrl) {
          try {
            console.log("[v0] Adding hero image to PDF")
            const firstImgWidth = pageWidth - 2 * margin
            const firstImgHeight = 240

            pdf.addImage(firstImg.dataUrl, "JPEG", margin, currentY, firstImgWidth, firstImgHeight)
            console.log("[v0] Hero image added successfully")
            currentY += firstImgHeight + 25
          } catch (error) {
            console.error("[v0] Failed to add hero image:", error)
          }
        }

        // Remaining images in 2-column grid
        const gridImgWidth = (pageWidth - 3 * margin) / 2
        const gridImgHeight = 150
        const imgSpacing = 20

        let imgX = margin
        let imgIndex = 1
        let imagesInRow = 0

        // Add remaining images on first page
        while (imgIndex < propertyImages.length && currentY + gridImgHeight < pageHeight - margin) {
          const currentImage = propertyImages[imgIndex]
          if (currentImage && currentImage.dataUrl) {
            try {
              console.log(`[v0] Adding grid image ${imgIndex + 1} to PDF`)
              pdf.addImage(currentImage.dataUrl, "JPEG", imgX, currentY, gridImgWidth, gridImgHeight)
              console.log(`[v0] Grid image ${imgIndex + 1} added successfully`)
            } catch (error) {
              console.error(`[v0] Failed to add grid image ${imgIndex + 1}:`, error)
            }
          }

          imgIndex++
          imagesInRow++

          if (imagesInRow === 2) {
            imgX = margin
            currentY += gridImgHeight + imgSpacing
            imagesInRow = 0
          } else {
            imgX += gridImgWidth + margin
          }
        }

        // Add additional pages if needed for remaining images
        while (imgIndex < propertyImages.length) {
          pdf.addPage()
          pdf.setFillColor(0, 0, 0)
          pdf.rect(0, 0, pageWidth, pageHeight, "F")

          currentY = margin
          imgX = margin
          imagesInRow = 0

          while (imgIndex < propertyImages.length && currentY + gridImgHeight < pageHeight - margin) {
            const currentImage = propertyImages[imgIndex]
            if (currentImage && currentImage.dataUrl) {
              try {
                console.log(`[v0] Adding image ${imgIndex + 1} on new page`)
                pdf.addImage(currentImage.dataUrl, "JPEG", imgX, currentY, gridImgWidth, gridImgHeight)
                console.log(`[v0] Image ${imgIndex + 1} added on new page`)
              } catch (error) {
                console.error(`[v0] Failed to add image ${imgIndex + 1}:`, error)
              }
            }

            imgIndex++
            imagesInRow++

            if (imagesInRow === 2) {
              imgX = margin
              currentY += gridImgHeight + imgSpacing
              imagesInRow = 0
            } else {
              imgX += gridImgWidth + margin
            }
          }
        }

        console.log("[v0] Property images page completed with all images")
      } else {
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(14)
        pdf.setFont("helvetica", "normal")
        pdf.text("No property images available for this listing.", pageWidth / 2, 150, { align: "center" })
        console.log("[v0] No property images to add to PDF - showing placeholder message")
      }

      // Save PDF
      const fileName = `OM_${listing.address.replace(/[^a-z0-9]/gi, "_")}.pdf`
      pdf.save(fileName)
      console.log("[v0] PDF saved successfully:", fileName)

      setOpen(false)
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      alert("Failed to generate PDF. Please check console for details.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
        <FileText className="w-4 h-4 mr-2" />
        Generate OM Memorandum
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Offering Memorandum</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate a professional Offering Memorandum (OM) PDF for this listing including property details,
              investment highlights, and images.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Document will include:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Cover page with property image</li>
                <li>✓ Investment summary with key metrics</li>
                <li>✓ Investment highlights</li>
                <li>✓ Property images gallery</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generatePDF}
                disabled={generating}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
