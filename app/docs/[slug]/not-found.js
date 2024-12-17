import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto py-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">404 - Documentation Not Found</h2>
        <p className="text-muted-foreground mb-8">
          We couldn&apos;t find the documentation you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>
        <Link href="/docs">
          <Button>Back to Documentation</Button>
        </Link>
      </div>
    </div>
  );
}
