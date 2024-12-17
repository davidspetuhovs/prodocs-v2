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

export default function CreateDocs() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState([{ title: "", content: "", order: 0 }]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchUserCompany = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/company');
          const data = await response.json();
          setCompany(data.data);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch company information",
            variant: "destructive",
          });
        }
      }
    };

    fetchUserCompany();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create slug from title
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => {
    setSections([...sections, { title: "", content: "", order: sections.length }]);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

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
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company" 
              value={company.name} 
              disabled 
            />
          </div>

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