"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "./dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Home, MapPin, Heart, ExternalLink, ChevronDown, Filter } from "lucide-react"
import Link from "next/link"

export function AgentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "agent") {
      router.push("/dashboard/admin")
      return
    }

    setUser(parsedUser)
    fetchListings(parsedUser.id)
  }, [router])

  const fetchListings = async (agentId: string) => {
    try {
      const response = await fetch(`/api/listings?agentId=${agentId}`)
      const data = await response.json()

      const listingsWithThumbnails = await Promise.all(
        (data.listings || []).map(async (listing: any) => {
          try {
            const filesResponse = await fetch(`/api/listing-files?listingId=${listing.id}&folder=Photos`)
            const filesData = await filesResponse.json()

            const imageFile = filesData.files?.[0]

            return {
              ...listing,
              thumbnail_url: imageFile?.file_url || null,
            }
          } catch (error) {
            console.error(`[v0] Error fetching files for listing ${listing.id}:`, error)
            return listing
          }
        }),
      )

      setListings(listingsWithThumbnails)
    } catch (error) {
      console.error("[v0] Error fetching listings:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white border-b">
        <DashboardHeader user={user} />
      </div>

      <div className="border-b bg-white">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-4">
              For Sale
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 font-medium px-4 bg-transparent">
              All Types
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 font-medium px-4 bg-transparent">
              Any Price
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 font-medium px-4 bg-transparent">
              Any CAP Rate
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="link" className="text-[#2563eb] font-medium px-4">
              <Filter className="w-4 h-4 mr-2" />
              All Filters (+1)
            </Button>
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-6">Save Search</Button>
            <Button variant="link" className="text-gray-600 font-medium px-4">
              Clear Filters
            </Button>
            <div className="ml-auto">
              <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white" asChild>
                <Link href="/dashboard/agent/create-listing">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Listings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-normal text-gray-900">My Properties for Sale</h1>
          </div>
          <Button variant="link" className="text-[#2563eb] font-medium">
            Export Results
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6 border-b">
          <div className="flex gap-8">
            <button className="pb-3 border-b-2 border-[#2563eb] text-[#2563eb] font-medium">Results</button>
            <button className="pb-3 text-gray-600 font-medium">Insights</button>
          </div>
          <div className="flex items-center gap-2 pb-3">
            <span className="text-sm text-gray-600">{listings.length} results</span>
            <Button variant="link" className="text-[#2563eb] text-sm">
              Recommended
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading listings...</div>
        ) : listings.length === 0 ? (
          <Card className="bg-white border">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">Create your first listing to get started</p>
              <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]" asChild>
                <Link href="/dashboard/agent/create-listing">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="group bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/dashboard/agent/listings/${listing.id}`} className="block">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {listing.thumbnail_url ? (
                      <img
                        src={listing.thumbnail_url || "/placeholder.svg"}
                        alt={listing.address}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Home className="w-20 h-20 text-gray-400" />
                      </div>
                    )}

                    {/* Status badge overlay */}
                    {listing.status === "under_approval" && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-amber-500 text-white text-xs px-3 py-1 rounded">UNDER APPROVAL</Badge>
                      </div>
                    )}

                    {/* Image counter - bottom right */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      1/13
                    </div>

                    {/* Favorite star - top right */}
                    <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow">
                      <Heart className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </Link>

                <div className="p-5 space-y-3">
                  {/* Price - large and bold */}
                  <div className="text-3xl font-bold text-gray-900">
                    ${listing.list_price?.toLocaleString() || "N/A"}
                  </div>

                  {/* Property name - bold */}
                  <h3 className="font-semibold text-base text-gray-900 line-clamp-2">{listing.address}</h3>

                  {/* Property details - light gray */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      {listing.property_type || listing.category_name} •{" "}
                      {listing.building_sf ? `${listing.building_sf.toLocaleString()} SqFt` : "N/A"}
                    </div>
                    {listing.lot_acres && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{listing.lot_acres} acres</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="text-sm text-gray-600">
                    {listing.city}, {listing.state} {listing.zip}
                  </div>

                  <Link
                    href={`/dashboard/agent/listings/${listing.id}`}
                    className="flex items-center gap-1.5 text-[#2563eb] hover:text-[#1d4ed8] text-sm font-medium pt-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Flyer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
