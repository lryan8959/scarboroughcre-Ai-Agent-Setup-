"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FolderPlus, Upload, Folder, File, Trash2 } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function ListingFilesPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [folders, setFolders] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setLoading(true)
      setError(null)
      console.log("[v0] Fetching listing files for:", listingId)

      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabase client not initialized. Please check environment variables.")
      }

      const listingResult = await supabase.from("listings").select("*").eq("id", listingId).single()

      console.log("[v0] Listing result:", listingResult)

      if (listingResult.error) {
        console.error("[v0] Listing error:", listingResult.error)
        throw new Error(`Failed to load listing: ${listingResult.error.message}`)
      }

      const filesResult = await supabase.from("listing_files").select("*").eq("listing_id", listingId)

      console.log("[v0] Files result:", filesResult)

      if (filesResult.error) {
        console.error("[v0] Files error:", filesResult.error)
        throw new Error(`Failed to load files: ${filesResult.error.message}`)
      }

      setListing(listingResult.data)
      setFiles(filesResult.data || [])

      console.log("[v0] Total files found:", filesResult.data?.length || 0)

      // Extract unique folders
      const uniqueFolders = Array.from(new Set(filesResult.data?.map((f: any) => f.folder_name).filter(Boolean)))
      console.log("[v0] Unique folders:", uniqueFolders)
      setFolders(uniqueFolders.map((name) => ({ name })))

      setLoading(false)
    } catch (error: any) {
      console.error("[v0] Error fetching data:", error)
      setError(error.message || "Failed to load files")
      setLoading(false)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Please enter a folder name")
      return
    }

    const folderExists = folders.some((f) => f.name === newFolderName)
    if (folderExists) {
      alert("Folder already exists")
      return
    }

    setFolders([...folders, { name: newFolderName }])
    setNewFolderName("")
    alert(`Folder "${newFolderName}" created! You can now select it and upload files.`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedFolder) return

    setUploading(true)
    const file = e.target.files[0]

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("listing_id", params.id as string)
      formData.append("folder_name", selectedFolder)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage")
      }

      const { url: fileUrl } = await uploadResponse.json()

      const supabase = getSupabaseClient()

      const { error } = await supabase.from("listing_files").insert({
        listing_id: params.id,
        folder_name: selectedFolder,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: fileUrl,
        file_url: fileUrl,
      })

      if (error) throw error

      alert("File uploaded successfully!")
      fetchData(params.id as string)
    } catch (error: any) {
      console.error("[v0] Error uploading file:", error)
      alert(`Failed to upload file: ${error.message}`)
    } finally {
      setUploading(false)
      // Reset file input
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("listing_files").delete().eq("id", fileId)

      if (error) throw error

      alert("File deleted successfully!")
      fetchData(params.id as string)
    } catch (error: any) {
      console.error("[v0] Error deleting file:", error)
      alert(`Failed to delete file: ${error.message}`)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <DashboardHeader user={user || { name: "User" }} />
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchData(params.id as string)}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !user || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  const filteredFiles = selectedFolder ? files.filter((f) => f.folder_name === selectedFolder) : files

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <DashboardHeader user={user} />
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/agent/listings/${params.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Listing
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Folders</CardTitle>
              <CardDescription>Organize files into folders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>New Folder</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        createFolder()
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={createFolder} className="bg-[#1e3a5f] hover:bg-[#152a45]">
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Button
                  variant={selectedFolder === null ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder(null)}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  All Files ({files.length})
                </Button>
                {folders.map((folder) => {
                  const folderFileCount = files.filter((f) => f.folder_name === folder.name).length
                  return (
                    <Button
                      key={folder.name}
                      variant={selectedFolder === folder.name ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder(folder.name)}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      {folder.name} ({folderFileCount})
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Files</CardTitle>
                  <CardDescription>{selectedFolder ? `Files in ${selectedFolder}` : "All files"}</CardDescription>
                </div>
                {selectedFolder && (
                  <div>
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
                      <Button
                        type="button"
                        disabled={uploading}
                        className="bg-[#1e3a5f] hover:bg-[#152a45]"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload File"}
                      </Button>
                    </Label>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedFolder && folders.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">Select a folder to upload and view files</div>
              )}
              {!selectedFolder && folders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Create a folder to get started with file management
                </div>
              )}
              {selectedFolder && filteredFiles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No files in this folder yet</div>
              )}
              {filteredFiles.length > 0 && (
                <div className="space-y-2">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{file.file_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : "Unknown size"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.file_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteFile(file.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
