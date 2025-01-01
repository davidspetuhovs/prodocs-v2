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
import apiClient from "@/libs/api";

export default function CreateDocsForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState([{ title: "", content: "", order: 0 }]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    const fetchUserCompany = async () => {
      if (session?.user?.id) {
        try {
          const { data } = await apiClient.get('/company');
          setCompany(data.data);
        } catch (error) {
          setError("Failed to fetch company information");
        }
      }
    };

    fetchUserCompany();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const response = await apiClient.post("/private/docs", {
        title,
        slug,
        sections,
        status
      });

      console.log('API Response:', response);
      console.log('Company Slug:', response?.company?.slug);
      console.log('Doc Slug:', response?.slug);

      toast({
        title: "Success",
        description: "Documentation created successfully",
      });

      const companySlug = response?.company?.slug;
      const docSlug = response?.slug;

      if (!companySlug || !docSlug) {
        console.error('Missing slugs:', { companySlug, docSlug, response });
        setError('Failed to get proper routing information');
        return;
      }

      router.push(`/${companySlug}/${docSlug}`);
    } catch (error) {
      setError(error.message);
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

  const removeSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    newSections.forEach((section, i) => {
      section.order = i;
    });
    setSections(newSections);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="space-y-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter documentation title"
          required
        />
      </div>

      <div className="space-y-4">
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
        <div className="flex justify-between items-center">
          <Label>Sections</Label>
          <Button type="button" onClick={addSection} variant="outline">
            Add Section
          </Button>
        </div>

        {sections.map((section, index) => (
          <Card key={index} className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor={`section-${index}-title`}>Section {index + 1}</Label>
              {sections.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeSection(index)}
                  variant="destructive"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>

            <Input
              id={`section-${index}-title`}
              value={section.title}
              onChange={(e) => updateSection(index, "title", e.target.value)}
              placeholder="Section title"
              required
            />

            <Textarea
              value={section.content}
              onChange={(e) => updateSection(index, "content", e.target.value)}
              placeholder="Section content"
              required
              className="min-h-[200px]"
            />
          </Card>
        ))}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Documentation"}
      </Button>
    </form>
  );
}