"use client"

import type React from "react"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Upload, FolderPlus, Trash2, FileText, ImageIcon } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [files, setFiles] = useState<any[]>([])
  const [folders, setFolders] = useState<{ name: string }[]>([])
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("Photos")
  const [uploadingFiles, setUploadingFiles] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchData(params.id as string)
  }, [router, params.id])

  const fetchData = async (listingId: string) => {
    try {
      const supabase = getSupabaseClient()

      const [listingResult, categoriesResult, filesResult] = await Promise.all([
        supabase.from("listings").select("*").eq("id", listingId).single(),
        supabase.from("listing_categories").select("*").order("name"),
        supabase
          .from("listing_files")
          .select("*")
          .eq("listing_id", listingId)
          .order("created_at", { ascending: false }),
      ])

      if (listingResult.error) throw listingResult.error
      if (categoriesResult.error) throw categoriesResult.error

      setListing(listingResult.data)
      setCategories(categoriesResult.data || [])

      if (filesResult.data) {
        setFiles(filesResult.data)
        const uniqueFolders = Array.from(new Set(filesResult.data.map((f: any) => f.folder_name)))
        setFolders(uniqueFolders.map((name) => ({ name: name as string })))
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      alert("Please enter a folder name")
      return
    }

    if (folders.some((f) => f.name.toLowerCase() === newFolderName.toLowerCase())) {
      alert("Folder already exists")
      return
    }

    setFolders([...folders, { name: newFolderName }])
    setSelectedFolder(newFolderName)
    setNewFolderName("")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles || uploadedFiles.length === 0) return

    setUploadingFiles(true)
    try {
      const supabase = getSupabaseClient()

      // Upload files to Vercel Blob storage
      const uploadPromises = Array.from(uploadedFiles).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        // Upload to Vercel Blob via API route
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file")
        }

        const { url } = await uploadResponse.json()

        // Save file metadata to database
        const fileData = {
          listing_id: params.id,
          file_name: file.name,
          file_type: file.type,
          file_url: url,
          file_path: url,
          file_size: file.size,
          folder_name: selectedFolder,
        }

        const { error } = await supabase.from("listing_files").insert(fileData)
        if (error) throw error

        return url
      })

      await Promise.all(uploadPromises)
      alert("Files uploaded successfully!")
      fetchData(params.id as string)
    } catch (error) {
      console.error("[v0] Error uploading files:", error)
      alert("Failed to upload files. Please try again.")
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("listing_files").delete().eq("id", fileId)

      if (error) throw error
      alert("File deleted successfully!")
      fetchData(params.id as string)
    } catch (error) {
      console.error("[v0] Error deleting file:", error)
      alert("Failed to delete file")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      const supabase = getSupabaseClient()

      const updateData: any = {
        address: formData.get("address"),
        city: formData.get("city"),
        state: formData.get("state"),
        zip: formData.get("zip"),
        list_price: Number.parseFloat(formData.get("list_price") as string),
        building_sf: formData.get("square_footage")
          ? Number.parseFloat(formData.get("square_footage") as string)
          : null,
        lot_acres: formData.get("lot_size") ? Number.parseFloat(formData.get("lot_size") as string) : null,
        year_built: formData.get("year_built") ? Number.parseInt(formData.get("year_built") as string) : null,
        listing_type: formData.get("listing_type"),
        description: formData.get("description") || null,
        zoning: formData.get("zoning") || null,
      }

      if (user.role === "admin") {
        updateData.status = formData.get("status")
      }

      const { data, error } = await supabase.from("listings").update(updateData).eq("id", params.id).select()

      if (error) {
        console.error("[v0] Supabase error details:", JSON.stringify(error, null, 2))
        throw error
      }

      alert("Listing updated successfully!")
      router.push(`/dashboard/agent/listings/${params.id}`)
    } catch (error) {
      console.error("[v0] Error updating listing:", error)
      alert("Failed to update listing. Check console for details.")
    } finally {
      setSaving(false)
    }
  }

  if (!user || loading || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <DashboardHeader user={user} />
      </div>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/agent/listings/${params.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Listing
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="info">Listing Information</TabsTrigger>
            <TabsTrigger value="files">Files & Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Listing</CardTitle>
                <CardDescription>Update your property listing information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input id="address" name="address" defaultValue={listing.address} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" name="city" defaultValue={listing.city} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input id="state" name="state" defaultValue={listing.state} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zip">Zip Code *</Label>
                      <Input id="zip" name="zip" defaultValue={listing.zip} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="listing_type">Listing Type *</Label>
                      <Select name="listing_type" defaultValue={listing.listing_type}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="for_sale">For Sale</SelectItem>
                          <SelectItem value="for_lease">For Lease</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {user.role === "admin" && (
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select name="status" defaultValue={listing.status}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under_approval">Under Approval</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="list_price">Price ($) *</Label>
                      <Input
                        id="list_price"
                        name="list_price"
                        type="number"
                        step="0.01"
                        defaultValue={listing.list_price}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="square_footage">Square Footage</Label>
                      <Input
                        id="square_footage"
                        name="square_footage"
                        type="number"
                        defaultValue={listing.building_sf || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lot_size">Lot Size (acres)</Label>
                      <Input
                        id="lot_size"
                        name="lot_size"
                        type="number"
                        step="0.01"
                        defaultValue={listing.lot_acres || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year_built">Year Built</Label>
                      <Input id="year_built" name="year_built" defaultValue={listing.year_built || ""} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zoning">Zoning</Label>
                      <Input
                        id="zoning"
                        name="zoning"
                        defaultValue={listing.zoning || ""}
                        placeholder="e.g., Commercial, Residential"
                      />
                    </div>

                    {/* Thumbnail upload section */}
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Listing Thumbnail Image</Label>
                      {listing.thumbnail_url && (
                        <div className="mb-2">
                          <img
                            src={listing.thumbnail_url || "/placeholder.svg"}
                            alt="Current thumbnail"
                            className="w-32 h-32 object-cover rounded border"
                          />
                        </div>
                      )}
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return

                          try {
                            const formData = new FormData()
                            formData.append("file", file)

                            const uploadResponse = await fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            })

                            if (!uploadResponse.ok) throw new Error("Upload failed")

                            const { url } = await uploadResponse.json()

                            const supabase = getSupabaseClient()
                            const { error } = await supabase
                              .from("listings")
                              .update({ thumbnail_url: url })
                              .eq("id", params.id)

                            if (error) throw error

                            alert("Thumbnail updated successfully!")
                            fetchData(params.id as string)
                          } catch (error) {
                            console.error("[v0] Error uploading thumbnail:", error)
                            alert("Failed to upload thumbnail")
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500">Upload a main image for this listing</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={listing.description || ""}
                      placeholder="Detailed description of the property..."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" asChild>
                      <Link href={`/dashboard/agent/listings/${params.id}`}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-[#1e3a5f] hover:bg-[#152a45] text-white">
                      {saving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Files & Documents</CardTitle>
                <CardDescription>Manage photos, documents, and other files for this listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Folder management */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFolder())}
                    />
                    <Button type="button" onClick={handleAddFolder} variant="outline">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Add Folder
                    </Button>
                  </div>

                  {/* Folder tabs */}
                  <div className="flex gap-2 flex-wrap">
                    {folders.map((folder) => (
                      <button
                        key={folder.name}
                        type="button"
                        onClick={() => setSelectedFolder(folder.name)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedFolder === folder.name
                            ? "bg-[#1e3a5f] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload files to {selectedFolder}
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileUpload}
                          disabled={uploadingFiles}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3 bg-transparent"
                          disabled={uploadingFiles}
                          asChild
                        >
                          <span>{uploadingFiles ? "Uploading..." : "Choose Files"}</span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Files list */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Files in {selectedFolder}</h3>
                  {files.filter((f) => f.folder_name === selectedFolder).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No files in this folder yet</p>
                  ) : (
                    <div className="space-y-2">
                      {files
                        .filter((f) => f.folder_name === selectedFolder)
                        .map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              {file.file_type?.startsWith("image/") ? (
                                <ImageIcon className="w-5 h-5 text-blue-500" />
                              ) : (
                                <FileText className="w-5 h-5 text-gray-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{file.file_name}</p>
                                <p className="text-xs text-gray-500">{(file.file_size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
