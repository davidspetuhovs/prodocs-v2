/**
 * Article Page Component
 * Displays domain information using the DomainDisplay component
 * 
 * Features:
 * 1. Shows current domain configuration
 * 2. Displays domain status and verification
 * 3. Provides domain management interface
 * 
 * @example
 * // Route: /article
 * // Component hierarchy:
 * // ArticlePage
 * // └── DomainDisplay
 */

import DomainDisplay from '@/components/DomainDisplay';

/**
 * ArticlePage Component
 * Simple wrapper component that provides layout and styling for the DomainDisplay
 * 
 * @returns {JSX.Element} Rendered article page with domain information
 */
export default function ArticlePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Domain Information</h1>
      <DomainDisplay />
    </div>
  );
}