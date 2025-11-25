"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FolderPlus, Folder, File, Trash2 } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import {
  createListing,
  updateListing,
  saveListingFile,
  updateThumbnail,
  getListingById,
} from "@/app/actions/create-listing"

const LISTING_TYPES = ["for_sale", "for_lease"]
const STATUSES = ["under_approval", "active", "closed"]

export default function CreateListingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const [user, setUser] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [categoryFields, setCategoryFields] = useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [folders, setFolders] = useState<string[]>(["Documents", "Photos", "Reports"])
  const [newFolderName, setNewFolderName] = useState("")
  const [filesByFolder, setFilesByFolder] = useState<Record<string, File[]>>({})
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { url: string }[]>>({})

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
    if (editId && user) {
      loadListingForEdit(editId)
    }
  }, [editId, user])

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
    const { data, error } = await supabase.from("categories").select("id, name").order("name")

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
      data.forEach((field: { field_name: string | number }) => {
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
    setSubmitting(true)

    try {
      if (editId) {
        console.log("[v0] Updating listing:", editId)

        const listingData = {
          category_id: formData.category_id,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          listing_type: formData.listing_type,
          status: formData.status,
          list_price: Number.parseFloat(formData.price) || 0,
          building_sf: Number.parseInt(formData.square_footage) || null,
          lot_acres: Number.parseFloat(formData.lot_size) || null,
          year_built: Number.parseInt(formData.year_built) || null,
          zoning: formData.zoning || null,
          property_type: formData.property_type || null,
          description: formData.description || null,
          form_data: categoryFields.reduce((acc: any, field: any) => {
            acc[field.field_name] = formData.custom_fields[field.field_name] || ""
            return acc
          }, {}),
        }

        const result = await updateListing(editId, listingData)

        if (result.error) {
          throw new Error(result.error)
        }

        // Update thumbnail if changed
        if (thumbnailFile) {
          await uploadThumbnail(editId, thumbnailFile)
        }

        // Save new files if any
        if (Object.keys(filesByFolder).length > 0) {
          console.log("[v0] Saving new files for listing:", editId)
          await handleSaveFiles(editId, filesByFolder)
        }

        console.log("[v0] Listing updated successfully")
        router.push(`/dashboard/agent/listings/${editId}`)
        return
      }

      console.log("[v0] Creating listing...")

      const listingData = {
        agent_id: user?.id,
        category_id: formData.category_id,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        listing_type: formData.listing_type,
        status: formData.status,
        list_price: Number.parseFloat(formData.price) || 0,
        building_sf: Number.parseInt(formData.square_footage) || null,
        lot_acres: Number.parseFloat(formData.lot_size) || null,
        year_built: Number.parseInt(formData.year_built) || null,
        zoning: formData.zoning || null,
        property_type: formData.property_type || null,
        description: formData.description || null,
        form_data: categoryFields.reduce((acc: any, field: any) => {
          acc[field.field_name] = formData.custom_fields[field.field_name] || ""
          return acc
        }, {}),
      }

      const result = await createListing(listingData)

      if (result.error) {
        throw new Error(result.error)
      }

      const listingId = result.data

      if (thumbnailFile) {
        await uploadThumbnail(listingId, thumbnailFile)
      }

      if (Object.keys(filesByFolder).length > 0) {
        console.log("[v0] Saving files for listing:", listingId)
        await handleSaveFiles(listingId, filesByFolder)
      }

      console.log("[v0] Listing created successfully")
      router.push("/dashboard/agent")
    } catch (error) {
      console.error("[v0] Error creating listing:", {
        message: error instanceof Error ? error.message : "Unknown error",
        error: error,
      })
      console.error(`[v0] Failed to create listing: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function uploadThumbnail(listingId: string, file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (uploadResponse.ok) {
      const { url } = await uploadResponse.json()
      await updateThumbnail(listingId, url)
      console.log("[v0] Thumbnail uploaded successfully")
    } else {
      const errorText = await uploadResponse.text()
      console.error("[v0] Upload failed:", errorText)
    }
  }

  async function handleSaveFiles(listingId: string, files: Record<string, File[]>) {
    for (const folder in files) {
      const folderFiles = files[folder]
      for (const file of folderFiles) {
        const saveResult = await saveListingFile({
          listing_id: listingId,
          file_name: file.name,
          file_type: file.type,
          file_url: URL.createObjectURL(file),
          file_path: file.name,
          file_size: file.size,
          folder_name: folder,
        })

        if (saveResult.error) {
          console.error("[v0] File save error:", saveResult.error)
        }
      }
    }
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      setFormData((prev) => ({ ...prev, thumbnail_url: URL.createObjectURL(file) }))
    }
  }

  async function loadListingForEdit(listingId: string) {
    try {
      const { data, error } = await getListingById(listingId)

      if (error || !data) {
        console.error("[v0] Error loading listing for edit:", error)
        return
      }

      console.log("[v0] Loaded listing for edit:", data)

      setSelectedCategoryId(data.category_id)

      setFormData({
        title: data.address || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip_code: data.zip_code || "",
        category_id: data.category_id || "",
        listing_type: data.listing_type || "for_sale",
        status: data.status || "under_approval",
        price: data.list_price?.toString() || "",
        square_footage: data.building_sf?.toString() || "",
        lot_size: data.lot_acres?.toString() || "",
        description: data.description || "",
        zoning: data.zoning || "",
        year_built: data.year_built?.toString() || "",
        property_type: data.property_type || "",
        custom_fields: data.custom_fields || {},
        thumbnail_url: data.thumbnail_url,
      })

      if (data.files && data.files.length > 0) {
        const existingFolders = Array.from(new Set(data.files.map((f: any) => f.folder_name)))
        setFolders(existingFolders as string[])

        const uploadedByFolder: Record<string, { url: string }[]> = {}
        data.files.forEach((file: any) => {
          if (!uploadedByFolder[file.folder_name]) {
            uploadedByFolder[file.folder_name] = []
          }
          uploadedByFolder[file.folder_name].push({
            url: file.file_url,
          })
        })
        setUploadedFiles(uploadedByFolder)
      }
    } catch (error) {
      console.error("[v0] Error loading listing for edit:", error)
    }
  }

  const selectedCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name || ""

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link
              href="/dashboard/agent"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-balance">{editId ? "Edit Listing" : "Create New Listing"}</h1>
              <p className="text-muted-foreground mt-2">
                {editId ? "Update your property details" : "Add a new property to your portfolio"}
              </p>
            </div>
          </div>
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
                  <Input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} />
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
                        {(uploadedFiles[folder] || []).map((file, index) => (
                          <div
                            key={`uploaded-${index}`}
                            className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-200"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <File className="h-4 w-4 text-blue-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {file.url.split("/").pop()?.substring(0, 50) || "File"}
                                </p>
                                <p className="text-xs text-blue-600">Already uploaded</p>
                              </div>
                            </div>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View
                            </a>
                          </div>
                        ))}

                        {/* New files pending upload */}
                        {(filesByFolder[folder] || []).map((file, index) => (
                          <div
                            key={`new-${index}`}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded border"
                          >
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
                        {(filesByFolder[folder] || []).length === 0 && (uploadedFiles[folder] || []).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No files uploaded yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/agent")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (editId ? "Updating..." : "Creating...") : editId ? "Update Listing" : "Create Listing"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
