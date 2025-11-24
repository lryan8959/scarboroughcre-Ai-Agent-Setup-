"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Home, Calendar, CheckCircle, XCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import FilesDisplay from "@/components/files-display" // Import FilesDisplay component

export default function AdminViewListingPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/dashboard/agent")
      return
    }

    setUser(parsedUser)
    fetchListing(params.id as string)
  }, [router, params.id])

  const fetchListing = async (listingId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          listing_categories (name),
          users (full_name, email)
        `)
        .eq("id", listingId)
        .single()

      if (error) throw error
      setListing(data)
    } catch (error) {
      console.error("[v0] Error fetching listing:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change the status to ${newStatus.replace("_", " ")}?`)) {
      return
    }

    setUpdating(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("listings").update({ status: newStatus }).eq("id", params.id)

      if (error) throw error

      alert("Status updated successfully!")
      fetchListing(params.id as string)
    } catch (error) {
      console.error("[v0] Error updating status:", error)
      alert("Failed to update status")
    } finally {
      setUpdating(false)
    }
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

      const { error } = await supabase.from("listings").delete().eq("id", params.id)

      if (error) throw error

      alert("Listing deleted successfully!")
      router.push("/dashboard/admin")
    } catch (error) {
      console.error("[v0] Error deleting listing:", error)
      alert("Failed to delete listing. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      under_approval: "bg-yellow-100 text-yellow-800 border-yellow-200",
      active: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-red-100 text-red-800 border-red-200",
    }
    return <Badge className={`${colors[status]} border`}>{status.replace("_", " ").toUpperCase()}</Badge>
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
        <DashboardHeader user={user} />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">Listing not found</div>
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
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
            onClick={handleDeleteListing}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? "Deleting..." : "Delete Listing"}
          </Button>
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

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Change Status:</label>
                <div className="flex gap-2">
                  <Button
                    variant={listing.status === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("active")}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={listing.status === "closed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("closed")}
                    disabled={updating}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Agent</div>
                <div className="text-base font-semibold">{listing.users?.full_name || "N/A"}</div>
                <div className="text-sm text-gray-500">{listing.users?.email}</div>
              </div>

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
                <div className="text-sm font-medium text-gray-500">Square Footage</div>
                <div className="text-base font-semibold">{listing.square_footage?.toLocaleString() || "N/A"} SF</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Lot Size</div>
                <div className="text-base font-semibold">{listing.lot_size || "N/A"} acres</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Year Built</div>
                <div className="text-base font-semibold">{listing.year_built || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Zoning</div>
                <div className="text-base font-semibold">{listing.zoning || "N/A"}</div>
              </div>
            </div>

            {listing.description && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {listing.custom_fields && Object.keys(listing.custom_fields).length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(listing.custom_fields).map(([key, value]) => (
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

            {/* Files & Documents Section */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Files & Documents</h3>
              <FilesDisplay listingId={params.id as string} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
