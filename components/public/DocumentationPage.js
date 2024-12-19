"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/libs/api";
import { Card } from "@/components/ui/card";

export default function DocumentationPage() {
  const params = useParams();
  const [doc, setDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (!params?.slug) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/api/public/docs/${params.slug}`);
        if (!mounted) return;

        if (response?.data) {
          setDoc(response.data);
        } else {
          setError('Invalid response format');
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [params]);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
      </div>

      <Card className="p-6">
        {doc.sections?.map((section, index) => (
          <div key={index} className="mb-6">
            {section.type === 'heading' ? (
              <h2 className="text-2xl font-semibold mb-4">{section.content}</h2>
            ) : (
              <div className="prose max-w-none">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}