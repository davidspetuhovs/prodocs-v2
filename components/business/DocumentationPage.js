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
      
      if (!params?.companySlug || !params?.documentationsSlug) {
        console.log('DocumentationPage: Missing companySlug or documentationsSlug in params');
        setError('Missing required parameters');
        setIsLoading(false);
        return;
      }

      try {
        console.log('DocumentationPage: Fetching document with companySlug:', params.companySlug, 'documentationsSlug:', params.documentationsSlug);
        const response = await apiClient.get(`/business/docs/${params.companySlug}/${params.documentationsSlug}`);
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
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [params]);

  if (isLoading) {
    console.log('DocumentationPage: Rendering loading state');
    return <div>Loading...</div>;
  }

  if (error) {
    console.log('DocumentationPage: Rendering error state:', error);
    return (
      <Card className="p-4">
        <div className="text-red-500">Error: {error}</div>
      </Card>
    );
  }

  if (!doc) {
    console.log('DocumentationPage: Rendering not found state');
    return (
      <Card className="p-4">
        <div>Documentation not found</div>
      </Card>
    );
  }

  console.log('DocumentationPage: Rendering document:', doc);
  return (
    <Card className="p-4">
      <h1 className="text-2xl font-bold mb-4">{doc.title}</h1>
      <div className="space-y-4">
        {doc.sections?.map((section, index) => (
          <div key={index} className="space-y-2">
            {section.title && (
              <h2 className="text-xl font-semibold">{section.title}</h2>
            )}
            {section.content && (
              <div className="prose max-w-none">{section.content}</div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}