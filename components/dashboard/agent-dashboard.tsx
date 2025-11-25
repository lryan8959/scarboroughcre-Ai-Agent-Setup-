"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "./dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Home, MapPin, Heart, ExternalLink, Search, X } from "lucide-react"
import Link from "next/link"

export function AgentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

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

      setListings(data.listings || [])
    } catch (error) {
      console.error("[v0] Error fetching listings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = listings.filter(
        (listing) =>
          listing.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.state.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchSuggestions(filtered.slice(0, 5))
      setShowSuggestions(true)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery, listings])

  const filteredListings = listings.filter((listing) => {
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter
    const matchesSearch =
      !searchQuery.trim() ||
      listing.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.state.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b">
        <DashboardHeader user={user} />
      </div>

      <div className="border-b bg-white">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter Location, Broker/Agent, or Description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                className="pl-10 pr-10 h-12 border-gray-300"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setShowSuggestions(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Search className="w-4 h-4" />
                      <span className="font-medium">SEARCH RESULTS</span>
                    </div>
                  </div>
                  {searchSuggestions.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/dashboard/agent/listings/${listing.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{listing.address}</div>
                        <div className="text-sm text-gray-600">
                          {listing.city}, {listing.state}
                        </div>
                      </div>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">For Sale</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setStatusFilter("all")}
                className={`${
                  statusFilter === "all"
                    ? "bg-[#2563eb] text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All ({listings.length})
              </Button>
              <Button
                onClick={() => setStatusFilter("under_approval")}
                className={`${
                  statusFilter === "under_approval"
                    ? "bg-[#2563eb] text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Pending ({listings.filter((l) => l.status === "under_approval").length})
              </Button>
              <Button
                onClick={() => setStatusFilter("active")}
                className={`${
                  statusFilter === "active"
                    ? "bg-[#2563eb] text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Active ({listings.filter((l) => l.status === "active").length})
              </Button>
            </div>

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
          <div className="text-sm text-gray-600">
            {filteredListings.length} {filteredListings.length === 1 ? "result" : "results"}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading listings...</div>
        ) : filteredListings.length === 0 ? (
          <Card className="bg-white border">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No listings match your search" : "No listings yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? "Try different keywords" : "Create your first listing to get started"}
              </p>
              {!searchQuery && (
                <Button className="bg-[#2563eb] hover:bg-[#1d4ed8]" asChild>
                  <Link href="/dashboard/agent/create-listing">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Listing
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="group bg-white border border-gray-200 rounded overflow-hidden hover:shadow-xl transition-shadow duration-300"
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

                    {listing.status === "under_approval" && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-amber-500 text-white text-xs px-3 py-1 rounded">UNDER APPROVAL</Badge>
                      </div>
                    )}

                    <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow">
                      <Heart className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </Link>

                <div className="p-5 space-y-3">
                  <div className="text-3xl font-bold text-gray-900">
                    ${listing.list_price?.toLocaleString() || "N/A"}
                  </div>

                  <h3 className="font-semibold text-base text-gray-900 line-clamp-2">{listing.address}</h3>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      {listing.property_type || listing.categories?.name} •{" "}
                      {listing.building_sf ? `${listing.building_sf.toLocaleString()} SqFt` : "N/A"}
                    </div>
                    {listing.lot_acres && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{listing.lot_acres} acres</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    {listing.city}, {listing.state} {listing.zip_code}
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
