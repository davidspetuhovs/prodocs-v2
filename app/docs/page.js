import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import User from "@/models/User";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function Docs() {
  const session = await getServerSession(authOptions);
  await connectMongo();
  
  // Get user with populated company
  const user = await User.findById(session.user.id).populate('company');
  
  const docs = await Documentation.find({ company: user.company._id })
    .sort({ updatedAt: -1 })
    .select('title slug status updatedAt');

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Documentation</h1>
        <Link href="/create-docs">
          <Button>Create New</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => (
          <Link key={doc._id} href={`/docs/${doc.slug}`}>
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <h2 className="font-semibold mb-2">{doc.title}</h2>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span className="capitalize">{doc.status}</span>
                <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </Card>
          </Link>
        ))}

        {docs.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No documentation found. Create your first documentation to get started.
          </div>
        )}
      </div>
    </div>
  );
}