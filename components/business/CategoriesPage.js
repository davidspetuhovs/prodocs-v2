"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import apiClient from "@/libs/api";

export default function CategoriesPage() {
  const params = useParams();
  const [docs, setDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinessDocs = async () => {
      try {
        console.log('CategoriesPage: Fetching docs for company slug:', params.companySlug);
        const response = await apiClient.get(`/business/docs/${params.companySlug}`);
        console.log('CategoriesPage: Received docs:', response);
        setDocs(response || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching business docs:", error);
        setError(error.response?.data?.error || "Failed to load documentation");
        setIsLoading(false);
      }
    };

    if (params.companySlug) {
      fetchBusinessDocs();
    } else {
      setError("Company slug is required");
      setIsLoading(false);
    }
  }, [params.companySlug]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Loading documentation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Documentation</h1>
      </div>

      {/* Documentation Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => {
          return (
            <Link key={doc.slug} href={`${params.companySlug}/${doc.slug}`}>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <h2 className="font-semibold mb-2">{doc.title}</h2>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                </div>
              </Card>
            </Link>
          );
        })}

        {/* Empty state message */}
        {docs.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No published documentation available.
          </div>
        )}
      </div>
    </div>
  );
}
