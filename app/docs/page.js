import dynamic from 'next/dynamic';

const PrivateDocsPage = dynamic(() => import('@/components/PrivateDocsPage'), { ssr: false });

export default function Docs() {
  return <PrivateDocsPage />;
}