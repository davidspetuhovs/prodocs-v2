import dynamic from 'next/dynamic';

const DocumentationPage = dynamic(() => import('@/components/public/DocumentationPage'), { ssr: false });

export default function PublicDocumentation() {
  return <DocumentationPage />;
}