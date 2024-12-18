"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/libs/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function PrivateDocsPage() {
  const { data: session } = useSession();
  const [docs, setDocs] = useState([]);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        console.log('Fetching docs...');
        const response = await apiClient.get("/private/docs");
        console.log('API Response:', response);
        const { data } = response;
        console.log('Docs data:', data);
        setDocs(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching docs:", error);
        console.error("Error details:", error.response?.data || error.message);
        setIsLoading(false);
      }
    };

    if (session) {
      console.log('Session found, fetching docs');
      fetchDocs();
    } else {
      console.log('No session found');
    }
  }, [session]);

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
        {Array.isArray(docs) && docs.map((doc) => (
          <Link key={doc.id || doc._id || doc.slug} href={`/docs/${doc.slug}`}>
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h2 className="font-semibold mb-2">{doc.title}</h2>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                {session && <span className="capitalize">{doc.status}</span>}
                <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </Card>
          </Link>
        ))}

        {/* Empty state message */}
        {(!docs || !Array.isArray(docs) || docs.length === 0) && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            {session 
              ? "No documentation found. Create your first documentation to get started."
              : "No published documentation available."
            }
          </div>
        )}
      </div>
    </div>
  );
}
