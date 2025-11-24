"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, MapPin, Calendar } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"

export function AdminViewListingClient({ listing }: { listing: any }) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)

  const statusColors = {
    under_approval: "bg-yellow-100 text-yellow-800 border-yellow-200",
    active: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
  }

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    const supabase = getSupabaseClient()

    const { error } = await supabase.from("listings").update({ status: newStatus }).eq("id", listing.id)

    if (error) {
      console.error("[v0] Error updating status:", error)
      alert("Failed to update status")
    } else {
      router.refresh()
    }
    setUpdating(false)
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex gap-3">
          {listing.status === "under_approval" && (
            <Button
              onClick={() => updateStatus("active")}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Listing
            </Button>
          )}
          {listing.status !== "closed" && (
            <Button
              onClick={() => updateStatus("closed")}
              disabled={updating}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Close Listing
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <Card className="overflow-hidden">
            <div className="relative h-96">
              <Image
                src={listing.thumbnail_url || "/placeholder.svg?height=384&width=768"}
                alt={listing.address}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={statusColors[listing.status as keyof typeof statusColors]}>
                  {listing.status.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {listing.listing_type === "for_sale" ? "For Sale" : "For Lease"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Property Details */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.address}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg">
                    {listing.city}, {listing.state} {listing.zip}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-semibold text-gray-900">{listing.listing_categories?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Listing Type</p>
                  <p className="font-semibold text-gray-900">
                    {listing.listing_type === "for_sale" ? "For Sale" : "For Lease"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Square Footage</p>
                  <p className="font-semibold text-gray-900">
                    {listing.building_sf ? `${listing.building_sf.toLocaleString()} SF` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Lot Size</p>
                  <p className="font-semibold text-gray-900">
                    {listing.lot_acres ? `${listing.lot_acres} acres` : "N/A"}
                  </p>
                </div>
              </div>

              {listing.form_data && Object.keys(listing.form_data).length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">Additional Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(listing.form_data).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-gray-500 mb-1 capitalize">{key.replace(/_/g, " ")}</p>
                        <p className="font-medium text-gray-900">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Price & Metadata */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Price</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">${listing.list_price?.toLocaleString() || "N/A"}</p>
              <p className="text-gray-500">/{listing.listing_type === "for_lease" ? "year" : "total"}</p>
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">Created on {new Date(listing.created_at).toLocaleDateString()}</span>
              </div>
              {listing.users && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Listed by</p>
                  <p className="font-medium text-gray-900">{listing.users.full_name || listing.users.email}</p>
                  <p className="text-sm text-gray-500 mt-1">{listing.users.email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
