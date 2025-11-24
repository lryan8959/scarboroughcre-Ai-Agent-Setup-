"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { FileText, ImageIcon, Folder } from "lucide-react"
import { Button } from "./ui/button"

export default function FilesDisplay({ listingId }: { listingId: string }) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string>("All")

  useEffect(() => {
    fetchFiles()
  }, [listingId])

  const fetchFiles = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("listing_files")
        .select("*")
        .eq("listing_id", listingId)
        .order("folder_name")

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error("[v0] Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const folders = ["All", ...Array.from(new Set(files.map((f) => f.folder_name)))]
  const displayFiles = selectedFolder === "All" ? files : files.filter((f) => f.folder_name === selectedFolder)

  if (loading) return <div className="text-center py-4 text-gray-500">Loading files...</div>

  if (files.length === 0) {
    return <div className="text-center py-8 text-gray-500">No files uploaded yet</div>
  }

  return (
    <div className="space-y-4">
      {/* Folder filters */}
      <div className="flex gap-2 flex-wrap">
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => setSelectedFolder(folder)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedFolder === folder ? "bg-[#2563eb] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Folder className="w-4 h-4 inline mr-1" />
            {folder} ({folder === "All" ? files.length : files.filter((f) => f.folder_name === folder).length})
          </button>
        ))}
      </div>

      {/* Files grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayFiles.map((file) => (
          <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            {file.file_type?.startsWith("image/") ? (
              <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.file_name}</p>
              <p className="text-xs text-gray-500">{file.folder_name}</p>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-[#2563eb]">
                View
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
