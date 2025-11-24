"use client"

import { Building2, MapPin, DollarSign } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ListingCardProps {
  listing: {
    id: string
    address: string
    city: string
    state: string
    list_price: number
    building_sf: number
    status: string
    listing_type: string
    property_type: string
    created_at: string
  }
  onClick?: () => void
}

export function ListingCard({ listing, onClick }: ListingCardProps) {
  const statusColors = {
    under_approval: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  }

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={`/commercial-real-estate-.jpg?height=300&width=400&query=commercial real estate ${listing.property_type}`}
          alt={listing.address}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className={statusColors[listing.status as keyof typeof statusColors]}>
            {getStatusLabel(listing.status)}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-5 w-5 text-navy" />
          <span className="text-2xl font-bold text-gray-900">${listing.list_price?.toLocaleString() || "N/A"}</span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">{listing.address}</p>
            <p className="text-sm text-gray-600">
              {listing.city}, {listing.state}
            </p>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{listing.building_sf?.toLocaleString() || "N/A"} SF</span>
          </div>
          <div className="text-sm text-gray-600">{listing.listing_type === "for_sale" ? "For Sale" : "For Lease"}</div>
        </div>
      </div>
    </Card>
  )
}
