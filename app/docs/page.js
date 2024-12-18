import dynamic from 'next/dynamic';

/**
 * Documentation Page Component
 * Handles both authenticated and public access to documentation
 * - For authenticated users: Fetches from /api/private/docs
 * - For public access: Fetches from /api/public/docs
 */
const DocsPage = dynamic(() => import('@/components/DocsPage'), { ssr: false });

export default function Docs() {
  return <DocsPage />;
}