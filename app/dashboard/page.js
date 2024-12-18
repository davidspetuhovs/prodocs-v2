/**
 * Dashboard Page Component
 * A protected page that requires authentication to access
 * 
 * Features:
 * 1. Server-side rendering
 * 2. Authentication protection via layout.js
 * 3. Account management functionality
 * 
 * Configuration:
 * - Uses force-dynamic to ensure fresh data on each request
 * - Protected by layout.js authentication check
 * 
 * @example
 * // Route: /dashboard
 * // Access: Private (requires authentication)
 * // Component hierarchy:
 * // Dashboard
 * // └── ButtonAccount
 */

import ButtonAccount from "@/components/ButtonAccount";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

/**
 * Dashboard Component
 * Main dashboard interface for authenticated users
 * 
 * Protected by:
 * - layout.js authentication check
 * - Server-side rendering for secure data fetching
 * 
 * @see https://shipfa.st/docs/tutorials/private-page
 * @returns {Promise<JSX.Element>} Rendered dashboard page
 */
export default async function Dashboard() {
  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <h1 className="text-3xl md:text-4xl font-extrabold">Private Page</h1>
      </section>
    </main>
  );
}