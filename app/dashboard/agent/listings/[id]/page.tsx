"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, MapPin, Home, FileText, ImageIcon, Folder } from "lucide-react"
import Link from "next/link"
import { getListingById } from "@/app/actions/get-listing"
import { SocialMediaPostGenerator } from "@/components/social-media-post-generator"
import { OMMemorandumGenerator } from "@/components/om-memorandum-generator"

export default function ViewListingPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string>("All")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    if (params.id) {
      fetchListing(params.id as string)
    }
  }, [router, params.id])

  const fetchListing = async (listingId: string) => {
    try {
      const { data, error } = await getListingById(listingId)

      if (error || !data) {
        console.error("[v0] Error fetching listing:", error)
        setListing(null)
      } else {
        console.log("[v0] Listing loaded:", data)
        setListing(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching listing:", error)
      setListing(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      under_approval: "bg-amber-100 text-amber-800 border-amber-300",
      active: "bg-emerald-100 text-emerald-800 border-emerald-300",
      closed: "bg-gray-100 text-gray-800 border-gray-300",
    }
    const labels: Record<string, string> = {
      under_approval: "UNDER APPROVAL",
      active: "ACTIVE",
      closed: "CLOSED",
    }
    return (
      <Badge className={`${colors[status]} border px-3 py-1 text-xs font-semibold`}>
        {labels[status] || status.toUpperCase()}
      </Badge>
    )
  }

  // Files organization
  const files = listing?.files || []
  const folderNames = Array.from(new Set(files.map((f: any) => f.folder_name))) as string[]
  const folders = ["All", ...folderNames]
  const displayFiles = selectedFolder === "All" ? files : files.filter((f: any) => f.folder_name === selectedFolder)

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12 text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <DashboardHeader user={user} />
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Listing not found</p>
            <Button asChild className="bg-[#1e3a5f] hover:bg-[#152a45]">
              <Link href="/dashboard/agent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <DashboardHeader user={user} />
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/agent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Listings
            </Link>
          </Button>
          <div className="flex gap-2">
            <OMMemorandumGenerator listing={listing} />
            <SocialMediaPostGenerator listing={listing} />
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white" asChild>
              <Link href={`/dashboard/agent/create-listing?edit=${listing.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Listing
              </Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg">
          {/* Large Hero Image */}
          <div className="relative h-96 bg-gradient-to-br from-slate-100 to-slate-200">
            {listing.thumbnail_url ? (
              <img
                src={listing.thumbnail_url || "/placeholder.svg"}
                alt={listing.address}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Home className="w-20 h-20 text-gray-400" />
              </div>
            )}
            <div className="absolute top-4 left-4">{getStatusBadge(listing.status)}</div>
          </div>

          {/* Property Header */}
          <div className="bg-white p-6 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.address}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">
                    {listing.city}, {listing.state} {listing.zip_code}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Asking Price</div>
                <div className="text-4xl font-bold text-[#2563eb]">${listing.list_price?.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-b">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">At a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Property Type</div>
                <div className="text-base font-semibold text-gray-900">{listing.property_type || "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Category</div>
                <div className="text-base font-semibold text-gray-900">{listing.categories?.name || "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Building Size</div>
                <div className="text-base font-semibold text-gray-900">
                  {listing.building_sf?.toLocaleString() || "N/A"} SF
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Lot Size</div>
                <div className="text-base font-semibold text-gray-900">
                  {listing.lot_acres?.toLocaleString() || "N/A"} acres
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Year Built</div>
                <div className="text-base font-semibold text-gray-900">{listing.year_built || "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Zoning</div>
                <div className="text-base font-semibold text-gray-900">{listing.zoning || "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Listing Type</div>
                <div className="text-base font-semibold text-gray-900 capitalize">
                  {listing.listing_type?.replace("_", " ") || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Date Listed</div>
                <div className="text-base font-semibold text-gray-900">
                  {new Date(listing.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="bg-white p-6 border-b">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">About This Property</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {/* Category-specific custom fields section */}
          {listing.custom_fields &&
            typeof listing.custom_fields === "object" &&
            Object.keys(listing.custom_fields).length > 0 && (
              <div className="bg-white p-6 border-b">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  {listing.categories?.name || "Additional"} Details
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.entries(listing.custom_fields).map(([key, value]) => {
                    if (value === null || value === undefined || value === "") return null

                    return (
                      <div key={key}>
                        <div className="text-sm text-gray-500 mb-1 capitalize">{key.replace(/_/g, " ")}</div>
                        <div className="text-base font-semibold text-gray-900">
                          {typeof value === "object" ? JSON.stringify(value) : value.toString()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          {files.length > 0 && (
            <div className="bg-white p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Documents & Files</h2>

              {/* Folder tabs */}
              <div className="flex gap-2 flex-wrap mb-4">
                {folders.map((folder: string) => (
                  <button
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedFolder === folder
                        ? "bg-[#2563eb] text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Folder className="w-4 h-4 inline mr-1.5" />
                    {folder} (
                    {folder === "All" ? files.length : files.filter((f: any) => f.folder_name === folder).length})
                  </button>
                ))}
              </div>

              {/* Files grid */}
              {displayFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayFiles.map((file: any) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border hover:border-[#2563eb] hover:shadow-md transition-all group"
                    >
                      {file.file_type?.startsWith("image/") ? (
                        <ImageIcon className="w-5 h-5 text-[#2563eb] flex-shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-[#2563eb]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#2563eb]">
                          {file.file_name}
                        </p>
                        <p className="text-xs text-gray-500">{file.folder_name}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No files in this folder</div>
              )}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
