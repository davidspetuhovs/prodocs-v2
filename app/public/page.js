import dynamic from 'next/dynamic';

const CategoriesPage = dynamic(() => import('@/components/public/CategoriesPage'), { ssr: false });

export default function PublicDocs() {
  return <CategoriesPage />;
}