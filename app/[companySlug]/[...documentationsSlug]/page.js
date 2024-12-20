import dynamic from 'next/dynamic';

const DocumentationPage = dynamic(() => import('@/components/business/DocumentationPage'), { ssr: false });

export default function Documentation({ params }) {
  // We get both the company and the full documentation path
  const { companySlug, documentationsSlug } = params;
  
  // documentationsSlug will be an array of path segments
  return <DocumentationPage 
    companySlug={companySlug} 
    documentPath={documentationsSlug} 
  />;
}
