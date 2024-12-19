import dynamic from 'next/dynamic';

const CategoriesPage = dynamic(() => import('@/components/business/CategoriesPage'), { ssr: false });

export default function BusinessDocs() {
  return <CategoriesPage />;
}
