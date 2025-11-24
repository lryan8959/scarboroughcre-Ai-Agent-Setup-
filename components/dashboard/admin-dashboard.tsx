"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "./dashboard-header"
import { Button } from "@/components/ui/button"
import { FileText, HomeIcon, MapPin } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"

export function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

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
    fetchAllListings()
  }, [router])

  const fetchAllListings = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("listings")
        .select("*, listing_categories(name)")
        .order("created_at", { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (error) {
      console.error("[v0] Error fetching listings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      under_approval: "bg-yellow-500 text-white",
      active: "bg-green-600 text-white",
      closed: "bg-gray-600 text-white",
    }
    return (
      <div className={`${colors[status] || "bg-gray-500 text-white"} uppercase text-xs font-semibold px-3 py-1`}>
        {status.replace("_", " ")}
      </div>
    )
  }

  const filteredListings = listings.filter((l) => filter === "all" || l.status === filter)

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage all listings and form configurations</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{listings.length}</div>
              <div className="text-sm text-gray-500 mt-1">Total Listings</div>
            </div>
            <div className="text-center border-l border-gray-200">
              <div className="text-3xl font-bold text-green-600">
                {listings.filter((l) => l.status === "active").length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Active</div>
            </div>
            <div className="text-center border-l border-gray-200">
              <div className="text-3xl font-bold text-yellow-600">
                {listings.filter((l) => l.status === "under_approval").length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Under Approval</div>
            </div>
            <div className="text-center border-l border-gray-200">
              <div className="text-3xl font-bold text-gray-600">
                {listings.filter((l) => l.status === "closed").length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Closed</div>
            </div>
          </div>
        </div>

        <div className="bg-[#2563eb] text-white rounded-lg p-4 mb-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  filter === "all" ? "bg-white text-[#2563eb]" : "bg-[#1d4ed8] hover:bg-[#1e40af]"
                }`}
              >
                All ({listings.length})
              </button>
              <button
                onClick={() => setFilter("under_approval")}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  filter === "under_approval" ? "bg-white text-[#2563eb]" : "bg-[#1d4ed8] hover:bg-[#1e40af]"
                }`}
              >
                Under Approval ({listings.filter((l) => l.status === "under_approval").length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  filter === "active" ? "bg-white text-[#2563eb]" : "bg-[#1d4ed8] hover:bg-[#1e40af]"
                }`}
              >
                Active ({listings.filter((l) => l.status === "active").length})
              </button>
              <button
                onClick={() => setFilter("closed")}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  filter === "closed" ? "bg-white text-[#2563eb]" : "bg-[#1d4ed8] hover:bg-[#1e40af]"
                }`}
              >
                Closed ({listings.filter((l) => l.status === "closed").length})
              </button>
            </div>
            <Button className="bg-white text-[#2563eb] hover:bg-gray-100 font-semibold" asChild>
              <Link href="/dashboard/admin/form-fields">
                <FileText className="w-4 h-4 mr-2" />
                Manage Fields
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading listings...</div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No listings found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/dashboard/admin/listings/${listing.id}`}
                className="group bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  {listing.thumbnail_url ? (
                    <img
                      src={listing.thumbnail_url || "/placeholder.svg"}
                      alt={listing.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HomeIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">{getStatusBadge(listing.status)}</div>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-gray-900">
                      ${listing.list_price?.toLocaleString() || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{listing.listing_type?.replace("_", " ")}</div>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">{listing.address}</h3>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {listing.city}, {listing.state} {listing.zip}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
                    {listing.building_sf && <span>{listing.building_sf.toLocaleString()} sqft</span>}
                    {listing.lot_acres && <span>{listing.lot_acres} acres</span>}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">{listing.listing_categories?.name || "N/A"}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
