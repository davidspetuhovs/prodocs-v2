import dynamic from 'next/dynamic';

const CategoriesPage = dynamic(() => import('@/components/business/CategoriesPage'), { ssr: false });

export default function CompanyPage({ params }) {
  const { companySlug } = params;
  
  return <CategoriesPage companySlug={companySlug} />;
}
