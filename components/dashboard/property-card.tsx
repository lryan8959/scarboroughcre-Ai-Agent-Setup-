"use client"

import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Home } from "lucide-react"

interface PropertyCardProps {
  listing: any
  role?: "admin" | "agent"
}

export function PropertyCard({ listing, role = "agent" }: PropertyCardProps) {
  const statusColors = {
    under_approval: "bg-yellow-100 text-yellow-800 border-yellow-200",
    active: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const typeColors = {
    for_sale: "bg-blue-100 text-blue-800",
    for_lease: "bg-purple-100 text-purple-800",
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Property Image */}
      <div className="relative h-56 bg-gray-100">
        {listing.thumbnail_url ? (
          <Image
            src={listing.thumbnail_url || "/placeholder.svg"}
            alt={listing.address || "Property"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={typeColors[listing.listing_type as keyof typeof typeColors]}>
            {listing.listing_type === "for_sale" ? "For Sale" : "For Lease"}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={statusColors[listing.status as keyof typeof statusColors]}>
            {listing.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 space-y-4">
        {/* Price */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold text-gray-900">${listing.list_price?.toLocaleString() || "N/A"}</span>
            <span className="text-gray-500 ml-2 text-sm">
              /{listing.listing_type === "for_lease" ? "year" : "total"}
            </span>
          </div>
        </div>

        {/* Title/Address */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">{listing.address}</h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {listing.city}, {listing.state} {listing.zip}
            </span>
          </div>
        </div>

        {/* Property Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium text-gray-900 line-clamp-1">
              {listing.listing_categories?.name || listing.category_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Square Footage</p>
            <p className="font-medium text-gray-900">
              {listing.building_sf ? `${listing.building_sf.toLocaleString()} SF` : "N/A"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" className="flex-1 hover:bg-gray-50 bg-transparent">
            <Link href={`/dashboard/${role}/listings/${listing.id}`}>View Details</Link>
          </Button>
          {role === "agent" && (
            <Button asChild variant="outline" className="flex-1 hover:bg-gray-50 bg-transparent">
              <Link href={`/dashboard/agent/listings/${listing.id}/files`}>Files</Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
