"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import apiClient from "@/libs/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function DocumentationPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const [doc, setDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (!params?.id) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/private/docs/${params.id}`);
        if (!mounted) return;

        if (response && typeof response === 'object') {
          setDoc(response);
        } else {
          setError('Invalid response format');
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchData();
    }

    return () => {
      mounted = false;
    };
  }, [status, session, params]);

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

  if (!doc) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Documentation not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
          <Badge variant={doc.status === 'published' ? 'default' : 'secondary'}>
            {doc.status}
          </Badge>
        </div>
        <Link href={`/docs/${doc._id}/edit`}>
          <Button>Edit Documentation</Button>
        </Link>
      </div>

      <Card className="p-6">
        {doc.sections?.map((section, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            <div className="prose max-w-none">
              {section.content}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
