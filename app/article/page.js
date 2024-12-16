import DomainDisplay from '@/components/DomainDisplay';

export default function ArticlePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Domain Information</h1>
      <DomainDisplay />
    </div>
  );
}