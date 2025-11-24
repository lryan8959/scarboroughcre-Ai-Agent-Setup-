"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
]

export default function FormFieldsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [fields, setFields] = useState<any[]>([])
  const [newField, setNewField] = useState({
    label: "",
    field_type: "text",
    required: false,
    options: "",
  })

  useEffect(() => {
    checkAuth()
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadFields()
    }
  }, [selectedCategory])

  async function checkAuth() {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userStr)
    if (user.role !== "admin") {
      router.push("/dashboard/agent")
    }
  }

  async function loadCategories() {
    const { data, error } = await supabase.from("listing_categories").select("id, name").order("name")

    if (!error && data && data.length > 0) {
      setCategories(data)
      setSelectedCategory(data[0].id)
    }
    setLoading(false)
  }

  async function loadFields() {
    const { data, error } = await supabase
      .from("form_fields")
      .select("*")
      .eq("category_id", selectedCategory)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("[v0] Error loading fields:", error)
    } else {
      setFields(data || [])
    }
  }

  async function addField() {
    if (!newField.label) {
      alert("Please enter a field label")
      return
    }

    const { error } = await supabase.from("form_fields").insert({
      category_id: selectedCategory,
      field_name: newField.label.toLowerCase().replace(/\s+/g, "_"),
      field_label: newField.label,
      field_type: newField.field_type,
      is_required: newField.required,
      field_options: newField.field_type === "select" ? newField.options.split(",").map((o) => o.trim()) : null,
      display_order: fields.length + 1,
    })

    if (error) {
      console.error("[v0] Error adding field:", error)
      alert("Failed to add field: " + error.message)
    } else {
      setNewField({ label: "", field_type: "text", required: false, options: "" })
      loadFields()
    }
  }

  async function deleteField(id: string) {
    if (!confirm("Are you sure you want to delete this field?")) return

    console.log("[v0] Deleting field:", id)
    const { error } = await supabase.from("form_fields").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting field:", error)
      alert("Failed to delete field: " + error.message)
    } else {
      console.log("[v0] Field deleted successfully")
      loadFields()
    }
  }

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name || ""

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Manage Form Fields</h1>
            <p className="text-gray-600 mt-1">Customize listing forms for each category</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-[#1a2332] text-white"
                    : "text-gray-600 hover:bg-gray-100 bg-white border border-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add New Field</CardTitle>
              <CardDescription>Create a new form field for {selectedCategoryName} listings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fieldLabel">Field Label *</Label>
                <Input
                  id="fieldLabel"
                  value={newField.label}
                  onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  placeholder="e.g., Number of Parking Spaces"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fieldType">Field Type *</Label>
                <Select
                  value={newField.field_type}
                  onValueChange={(value) => setNewField({ ...newField, field_type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newField.field_type === "select" && (
                <div>
                  <Label htmlFor="options">Dropdown Options *</Label>
                  <Input
                    id="options"
                    value={newField.options}
                    onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                    placeholder="Option 1, Option 2, Option 3"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate options with commas</p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={newField.required}
                  onCheckedChange={(checked) => setNewField({ ...newField, required: checked as boolean })}
                />
                <Label htmlFor="required" className="cursor-pointer font-normal">
                  Required field
                </Label>
              </div>

              <Button onClick={addField} className="w-full bg-[#1a2332] hover:bg-[#2a3442] text-white" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Fields</CardTitle>
              <CardDescription>
                {fields.length} field{fields.length !== 1 ? "s" : ""} configured for {selectedCategoryName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">Loading...</p>
                </div>
              ) : fields.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">No custom fields yet. Add one to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-navy/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{field.field_label}</h4>
                          {field.is_required && (
                            <span className="text-xs bg-navy text-white px-2 py-0.5 rounded">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Type: {field.field_type}
                          {field.field_options && Array.isArray(field.field_options) && (
                            <span className="ml-2">• Options: {field.field_options.join(", ")}</span>
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteField(field.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
