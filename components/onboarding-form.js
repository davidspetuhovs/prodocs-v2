"use client";

import { GalleryVerticalEnd } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function OnboardingForm({
  className,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: ""
  })
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }
      
      toast.success("Company created successfully!")
      router.push(`/dashboard`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "name") {
      // Auto-generate slug from company name
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      setFormData(prev => ({
        ...prev,
        name: value,
        slug
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Qalileo</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Qalileo</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Company Name</Label>
              <Input 
                id="name"
                name="name"
                type="text" 
                placeholder="Acme Inc." 
                required 
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Company Subdomain</Label>
              <div className="flex items-center">
                <Input 
                  id="slug"
                  name="slug"
                  type="text" 
                  placeholder="acme" 
                  className="rounded-r-none border-r-0"
                  required 
                  value={formData.slug}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <div className="flex h-9 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                  .qalileo.com
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Finish Onboarding"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
