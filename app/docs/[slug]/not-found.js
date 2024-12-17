import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto py-20">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Documentation Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The documentation you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link href="/docs">
          <Button>Return to Documentation</Button>
        </Link>
      </div>
    </div>
  );
}
