/**
 * Create Documentation Page Component
 * Provides a form interface for creating new documentation with multiple sections
 * 
 * Features:
 * 1. Title and slug generation
 * 2. Dynamic section management
 * 3. Draft/Published status selection
 * 4. Company association
 * 5. Real-time validation and error handling
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

/**
 * CreateDocs Component
 * Main form component for creating new documentation
 * 
 * @example
 * // Document structure
 * {
 *   title: "Getting Started",
 *   slug: "getting-started",
 *   sections: [
 *     {
 *       title: "Introduction",
 *       content: "Welcome to...",
 *       order: 0
 *     }
 *   ],
 *   status: "draft",
 *   company: "company_id"
 * }
 */
export default function CreateDocs() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // Form state management
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState([{ title: "", content: "", order: 0 }]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  // Error handling effect
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Company data fetching effect
  useEffect(() => {
    const fetchUserCompany = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/company');
          const data = await response.json();
          setCompany(data.data);
        } catch (error) {
          setError("Failed to fetch company information");
        }
      }
    };

    fetchUserCompany();
  }, [session]);

  /**
   * Handles form submission
   * 1. Generates slug from title
   * 2. Creates documentation via API
   * 3. Redirects to new documentation page
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate URL-friendly slug from title
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const response = await fetch("/api/docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          sections,
          company: company._id,
          status
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast({
        title: "Success",
        description: "Documentation created successfully",
      });

      router.push(`/docs/${result.data.slug}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adds a new empty section to the document
   * Automatically sets the order based on current section count
   */
  const addSection = () => {
    setSections([...sections, { title: "", content: "", order: sections.length }]);
  };

  /**
   * Updates a specific field in a section
   * @param {number} index - Section index to update
   * @param {string} field - Field to update ('title' or 'content')
   * @param {string} value - New value for the field
   */
  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  // Loading state while fetching company data
  if (!company) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Loading company information...</h1>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create Documentation</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>

          {/* Company display (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company" 
              value={company.name} 
              disabled 
            />
          </div>

          {/* Publication status selector */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic sections management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Sections</Label>
              <Button type="button" variant="outline" onClick={addSection}>
                Add Section
              </Button>
            </div>
            
            {sections.map((section, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <Input
                  placeholder="Section Title"
                  value={section.title}
                  onChange={(e) => updateSection(index, "title", e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Section Content"
                  value={section.content}
                  onChange={(e) => updateSection(index, "content", e.target.value)}
                  required
                />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Documentation"}
          </Button>
        </form>
      </Card>
    </div>
  );
}