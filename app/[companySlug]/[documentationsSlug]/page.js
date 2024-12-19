import dynamic from 'next/dynamic';

const BusinessDocumentationPage = dynamic(() => import('@/components/business/DocumentationPage'), { ssr: false });

export default function BusinessDocumentation() {
  return <BusinessDocumentationPage />;
}
