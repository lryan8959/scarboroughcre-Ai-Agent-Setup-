"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, MapPin, Home, Calendar, Trash2 } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import FilesDisplay from "@/components/files-display"

export default function ViewListingPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

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
      console.log("[v0] Fetching listing:", listingId)
      const supabase = getSupabaseClient()

      const [listingResult, filesResult] = await Promise.all([
        supabase
          .from("listings")
          .select(`
            *,
            listing_categories (name),
            users (full_name, email)
          `)
          .eq("id", listingId)
          .single(),
        supabase.from("listing_files").select("*").eq("listing_id", listingId).eq("folder_name", "Photos").limit(1),
      ])

      if (listingResult.error) {
        console.error("[v0] Error fetching listing:", listingResult.error)
        throw listingResult.error
      }

      console.log("[v0] Listing fetched successfully:", listingResult.data)
      console.log("[v0] Files fetched:", filesResult.data)

      const listingWithThumbnail = {
        ...listingResult.data,
        thumbnail_url: listingResult.data.thumbnail_url || filesResult.data?.[0]?.file_url || null,
      }

      setListing(listingWithThumbnail)
    } catch (error) {
      console.error("[v0] Error fetching listing:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      under_approval: "secondary",
      active: "default",
      closed: "destructive",
    }
    const colors: Record<string, string> = {
      under_approval: "bg-yellow-100 text-yellow-800 border-yellow-200",
      active: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-red-100 text-red-800 border-red-200",
    }
    return <Badge className={`${colors[status]} border`}>{status.replace("_", " ").toUpperCase()}</Badge>
  }

  const handleDeleteListing = async () => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    try {
      const supabase = getSupabaseClient()

      const { error: filesError } = await supabase.from("listing_files").delete().eq("listing_id", params.id)

      if (filesError) {
        console.error("[v0] Error deleting files:", filesError)
      }

      // Delete the listing
      const { error } = await supabase.from("listings").delete().eq("id", params.id)

      if (error) throw error

      router.push("/dashboard/agent")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting listing:", error)
      alert("Failed to delete listing. Please try again.")
      setDeleting(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">Loading...</div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/agent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </Link>
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
              onClick={handleDeleteListing}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/agent/listings/${listing.id}/files`}>Manage Files</Link>
            </Button>
            <Button className="bg-[#1e3a5f] hover:bg-[#152a45]" asChild>
              <Link href={`/dashboard/agent/listings/${listing.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Listing
              </Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
            {listing.thumbnail_url ? (
              <img
                src={listing.thumbnail_url || "/placeholder.svg"}
                alt={listing.address}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Home className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="absolute top-4 right-4">{getStatusBadge(listing.status)}</div>
          </div>

          <CardHeader className="border-b bg-white">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{listing.address}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4" />
                  {listing.city}, {listing.state} {listing.zip}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="text-3xl font-bold text-[#1e3a5f]">${listing.list_price?.toLocaleString()}</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Category</div>
                <div className="text-base font-semibold">{listing.listing_categories?.name || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Listing Type</div>
                <div className="text-base font-semibold capitalize">
                  {listing.listing_type?.replace("_", " ") || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className="text-base font-semibold capitalize">{listing.status?.replace("_", " ") || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Price</div>
                <div className="text-base font-semibold">${listing.list_price?.toLocaleString() || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Square Footage</div>
                <div className="text-base font-semibold">{listing.building_sf?.toLocaleString() || "N/A"} SF</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Lot Size</div>
                <div className="text-base font-semibold">{listing.lot_acres?.toLocaleString() || "N/A"} acres</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Year Built</div>
                <div className="text-base font-semibold">{listing.year_built || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Zoning</div>
                <div className="text-base font-semibold">{listing.zoning || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Property Type</div>
                <div className="text-base font-semibold">{listing.property_type || "N/A"}</div>
              </div>
            </div>

            {listing.description && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {listing.form_data && Object.keys(listing.form_data).length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(listing.form_data).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, " ")}</div>
                      <div className="text-base font-semibold">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created on {new Date(listing.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files & Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle>Files & Documents</CardTitle>
            <CardDescription>Uploaded photos, documents, and files for this listing</CardDescription>
          </CardHeader>
          <CardContent>
            <FilesDisplay listingId={params.id as string} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
