import dynamic from 'next/dynamic';

const DocumentationPage = dynamic(() => import('@/components/private/DocumentationPage'), { ssr: false });

export default function DocPage() {
  return <DocumentationPage />;
}