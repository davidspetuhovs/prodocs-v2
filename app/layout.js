/**
 * Root Layout Component
 * This is the top-level layout component that wraps all pages in the application.
 * It provides:
 * 1. Global font configuration (Inter)
 * 2. Default SEO tags
 * 3. Viewport settings
 * 4. Client-side wrappers (chat, toasts, tooltips)
 */

import { Inter } from "next/font/google";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";

// Configure Inter font with Latin subset for optimal performance
const font = Inter({ subsets: ["latin"] });

/**
 * Viewport Configuration
 * Defines responsive behavior and initial scaling
 * Supports theme color in compatible browsers
 */
export const viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	width: "device-width",
	initialScale: 1,
};

/**
 * Default SEO Configuration
 * Applied to all pages but can be overridden at page level
 * @see libs/seo.js for available options
 */
export const metadata = getSEOTags();

/**
 * Root Layout Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to be wrapped
 * @returns {JSX.Element} HTML structure with configured fonts and client wrappers
 */
export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			className={font.className}
		>
			<body>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
