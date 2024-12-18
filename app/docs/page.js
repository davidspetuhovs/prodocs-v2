import dynamic from 'next/dynamic';

const CategoriesPage = dynamic(() => import('@/components/private/CategoriesPage'), { ssr: false });

export default function Docs() {
  return <CategoriesPage />;
}