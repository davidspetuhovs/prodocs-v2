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
      console.log('DocumentationPage: Starting fetch, params:', params);
      
      if (!params?.slug) {
        console.log('DocumentationPage: No slug found in params');
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        console.log('DocumentationPage: Fetching document with slug:', params.slug);
        // Remove the /api prefix since it's already included in apiClient configuration
        const response = await apiClient.get(`/public/docs/${params.slug}`);
        console.log('DocumentationPage: API Response:', response);
        
        if (!mounted) {
          console.log('DocumentationPage: Component unmounted, skipping state update');
          return;
        }

        if (response?.data) {
          console.log('DocumentationPage: Setting document data:', response.data);
          setDoc(response.data);
        } else {
          console.log('DocumentationPage: Invalid response format:', response);
          setError('Invalid response format');
        }
      } catch (err) {
        console.error('DocumentationPage Error:', err);
        if (mounted) {
          console.log('DocumentationPage: Setting error state:', err.message);
          setError(err.message);
        }
      } finally {
        if (mounted) {
          console.log('DocumentationPage: Setting loading state to false');
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
      console.log('DocumentationPage: Cleanup - component unmounting');
    };
  }, [params]);

  if (isLoading) {
    console.log('DocumentationPage: Rendering loading state');
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Loading documentation...</div>
      </div>
    );
  }

  if (error) {
    console.log('DocumentationPage: Rendering error state:', error);
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!doc) {
    console.log('DocumentationPage: Rendering not found state');
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Documentation not found</div>
      </div>
    );
  }

  console.log('DocumentationPage: Rendering document:', doc.title);
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