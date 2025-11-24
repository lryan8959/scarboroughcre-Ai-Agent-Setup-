"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FolderPlus, Folder, File, Trash2 } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"

const LISTING_TYPES = ["for_sale", "for_lease"]
const STATUSES = ["under_approval", "active", "closed"]

export default function CreateListingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [categoryFields, setCategoryFields] = useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [folders, setFolders] = useState<string[]>(["Documents", "Photos", "Reports"])
  const [newFolderName, setNewFolderName] = useState("")
  const [filesByFolder, setFilesByFolder] = useState<Record<string, File[]>>({})

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    category_id: "",
    listing_type: "for_sale",
    status: "under_approval",
    price: "",
    square_footage: "",
    lot_size: "",
    description: "",
    zoning: "",
    year_built: "",
    property_type: "",
    custom_fields: {} as Record<string, any>,
    thumbnail_url: null as string | null,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  useEffect(() => {
    if (selectedCategoryId) {
      loadCategoryFields()
      setFormData((prev) => ({ ...prev, category_id: selectedCategoryId }))
    }
  }, [selectedCategoryId])

  function checkAuth() {
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
  }

  async function loadCategories() {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("listing_categories").select("id, name").order("name")

    if (!error && data && data.length > 0) {
      setCategories(data)
      setSelectedCategoryId(data[0].id)
    }
  }

  async function loadCategoryFields() {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("form_fields")
      .select("*")
      .eq("category_id", selectedCategoryId)
      .order("display_order")

    if (!error && data) {
      setCategoryFields(data)
      const initialCustomFields: Record<string, any> = {}
      data.forEach((field) => {
        initialCustomFields[field.field_name] = ""
      })
      setFormData((prev) => ({ ...prev, custom_fields: initialCustomFields }))
    }
  }

  function handleAddFolder() {
    if (newFolderName && !folders.includes(newFolderName)) {
      setFolders([...folders, newFolderName])
      setNewFolderName("")
    }
  }

  function handleFileChange(folder: string, e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFilesByFolder((prev) => ({
        ...prev,
        [folder]: [...(prev[folder] || []), ...newFiles],
      }))
    }
  }

  function removeFileFromFolder(folder: string, index: number) {
    setFilesByFolder((prev) => ({
      ...prev,
      [folder]: (prev[folder] || []).filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabaseClient()

      const squareFootage = formData.square_footage ? Number.parseInt(formData.square_footage, 10) : null
      const lotSize = formData.lot_size ? Number.parseFloat(formData.lot_size) : null
      const yearBuilt = formData.year_built ? Number.parseInt(formData.year_built, 10) : null
      const price = formData.price ? Number.parseFloat(formData.price) : null

      console.log("[v0] Creating listing with data:", {
        squareFootage,
        lotSize,
        yearBuilt,
        price,
      })

      // Create the listing first
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          agent_id: user.id,
          category_id: formData.category_id,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip_code,
          list_price: price,
          building_sf: squareFootage,
          lot_acres: lotSize,
          year_built: yearBuilt,
          listing_type: formData.listing_type,
          status: formData.status,
          property_type: formData.property_type,
          description: formData.description || null,
          zoning: formData.zoning || null,
          form_data: formData.custom_fields,
          thumbnail_url: formData.thumbnail_url,
        })
        .select()
        .single()

      if (listingError) {
        console.error("[v0] Listing creation error:", listingError)
        throw listingError
      }

      if (listing) {
        let firstImageUrl: string | null = null

        // Upload files to Vercel Blob storage
        for (const folder of folders) {
          const folderFiles = filesByFolder[folder] || []
          for (const file of folderFiles) {
            try {
              const uploadFormData = new FormData()
              uploadFormData.append("file", file)

              const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
              })

              if (uploadResponse.ok) {
                const { url } = await uploadResponse.json()

                // Save first photo as thumbnail
                if (folder === "Photos" && !firstImageUrl) {
                  firstImageUrl = url
                }

                // Save file metadata to database
                const { error: fileError } = await supabase.from("listing_files").insert({
                  listing_id: listing.id,
                  file_name: file.name,
                  file_type: file.type,
                  file_url: url,
                  file_path: url,
                  file_size: file.size,
                  folder_name: folder,
                })

                if (fileError) {
                  console.error("[v0] File save error:", fileError)
                }
              } else {
                const errorText = await uploadResponse.text()
                console.error("[v0] Upload failed:", errorText)
                // Continue with other files even if one fails
              }
            } catch (uploadError) {
              console.error("[v0] File upload error:", uploadError)
              // Continue with other files
            }
          }
        }

        // Update listing with thumbnail if we have one
        if (firstImageUrl && !formData.thumbnail_url) {
          await supabase.from("listings").update({ thumbnail_url: firstImageUrl }).eq("id", listing.id)
        }
      }

      alert("Listing created successfully!")
      router.push("/dashboard/agent")
    } catch (error) {
      console.error("[v0] Error creating listing:", error)
      alert(`Failed to create listing: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const selectedCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name || ""

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard/agent">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-gray-600 mt-1">Add a new property to your portfolio</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the main details about the property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label>Category *</Label>
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} required>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Address *</Label>
                    <Input
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <Label>City *</Label>
                    <Input
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <Label>State *</Label>
                    <Input
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <Label>Zip Code *</Label>
                    <Input
                      required
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                      placeholder="Zip code"
                    />
                  </div>

                  <div>
                    <Label>Listing Type *</Label>
                    <Select
                      value={formData.listing_type}
                      onValueChange={(value) => setFormData({ ...formData, listing_type: value })}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="for_sale">For Sale</SelectItem>
                        <SelectItem value="for_lease">For Lease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_approval">Under Approval</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>Square Footage</Label>
                    <Input
                      type="number"
                      value={formData.square_footage}
                      onChange={(e) => setFormData({ ...formData, square_footage: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>Lot Size (acres)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.lot_size}
                      onChange={(e) => setFormData({ ...formData, lot_size: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label>Year Built</Label>
                    <Input
                      type="number"
                      value={formData.year_built}
                      onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                      placeholder="YYYY"
                    />
                  </div>

                  <div>
                    <Label>Zoning</Label>
                    <Input
                      value={formData.zoning}
                      onChange={(e) => setFormData({ ...formData, zoning: e.target.value })}
                      placeholder="e.g., Commercial"
                    />
                  </div>

                  <div>
                    <Label>Property Type</Label>
                    <Input
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                      placeholder="e.g., Office Building"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the property..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Listing Thumbnail Image</Label>
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const formData = new FormData()
                        formData.append("file", file)

                        fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                        })
                          .then((res) => res.json())
                          .then(({ url }) => {
                            setFormData((prev) => ({ ...prev, thumbnail_url: url }))
                            alert("Thumbnail uploaded successfully!")
                          })
                          .catch(() => alert("Failed to upload thumbnail"))
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Upload a main image for this listing (appears in search results)
                  </p>
                </div>
              </CardContent>
            </Card>

            {categoryFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCategoryName} Details</CardTitle>
                  <CardDescription>Category-specific information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {categoryFields.map((field) => (
                      <div key={field.id} className={field.field_type === "textarea" ? "md:col-span-2" : ""}>
                        <Label>
                          {field.field_label}
                          {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field.field_type === "textarea" ? (
                          <Textarea
                            required={field.is_required}
                            value={formData.custom_fields[field.field_name] || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                custom_fields: { ...formData.custom_fields, [field.field_name]: e.target.value },
                              })
                            }
                            className="mt-1"
                          />
                        ) : field.field_type === "select" && field.field_options ? (
                          <Select
                            value={formData.custom_fields[field.field_name] || ""}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                custom_fields: { ...formData.custom_fields, [field.field_name]: value },
                              })
                            }
                            required={field.is_required}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {(field.field_options as string[]).map((option: string) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.field_type}
                            required={field.is_required}
                            value={formData.custom_fields[field.field_name] || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                custom_fields: { ...formData.custom_fields, [field.field_name]: e.target.value },
                              })
                            }
                            className="mt-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Files & Documents</CardTitle>
                <CardDescription>Upload photos, documents, and other files organized by folder</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddFolder()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddFolder} variant="outline">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Add Folder
                  </Button>
                </div>

                <div className="space-y-4">
                  {folders.map((folder) => (
                    <div key={folder} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Folder className="h-4 w-4 text-navy" />
                          {folder}
                        </h4>
                        <label className="cursor-pointer">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Files
                            </span>
                          </Button>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileChange(folder, e)}
                          />
                        </label>
                      </div>

                      <div className="space-y-2">
                        {(filesByFolder[folder] || []).map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                            <div className="flex items-center gap-2 flex-1">
                              <File className="h-4 w-4 text-gray-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFileFromFolder(folder, index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {(filesByFolder[folder] || []).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No files uploaded yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/agent")}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-[#1a2332] hover:bg-[#2a3442] text-white">
                {loading ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
