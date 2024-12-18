/**
 * Onboarding Page Component
 * Handles user onboarding process with a form-based interface
 * 
 * Features:
 * 1. Responsive design
 * 2. Centered layout
 * 3. Form-based user data collection
 * 
 * Layout:
 * - Full viewport height
 * - Centered content
 * - Responsive padding
 * - Width-constrained form
 * 
 * @example
 * // Route: /onboarding
 * // Component hierarchy:
 * // LoginPage
 * // └── OnboardingForm
 */

import { OnboardingForm } from "@/components/onboarding-form"

/**
 * LoginPage Component
 * Provides the layout and structure for the onboarding process
 * 
 * Styling:
 * - Uses min-h-svh for full viewport height
 * - Flexbox for centered alignment
 * - Responsive padding (p-6 on mobile, p-10 on desktop)
 * - Width-constrained form (max-w-xs)
 * 
 * @returns {JSX.Element} Rendered onboarding page with form
 */
export default function LoginPage() {
  return (
    (<div
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-xs">
        <OnboardingForm />
        <div></div>
      </div>
    </div>)
  );
}
