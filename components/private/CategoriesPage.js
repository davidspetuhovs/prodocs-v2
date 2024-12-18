"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/libs/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const [docs, setDocs] = useState([]);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await apiClient.get("/private/docs");
        if (response?.data && Array.isArray(response.data)) {
          setDocs(response.data);
        } else if (Array.isArray(response)) {
          setDocs(response);
        } else {
          setDocs([]);
        }
      } catch (error) {
        console.error("Error fetching docs:", error);
        setError(error.message || 'Failed to fetch documents');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated' && session) {
      fetchDocs();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [session, status]);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          {company?.name ? `${company.name} Documentation` : 'Documentation'}
        </h1>
        {session && (
          <Link href="/create-docs">
            <Button>Create New</Button>
          </Link>
        )}
      </div>

      {/* Documentation Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.length > 0 ? (
          docs.map((doc) => (
            <Link key={doc._id} href={`/docs/${doc._id}`}>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <h2 className="font-semibold mb-2">{doc.title}</h2>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  {session && <span className="capitalize">{doc.status}</span>}
                  <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            {status === 'authenticated' 
              ? "No documentation found. Create your first documentation to get started."
              : "Please sign in to view documentation."
            }
          </div>
        )}
      </div>
    </div>
  );
}
