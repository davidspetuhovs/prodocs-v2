import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import User from "@/models/User";

export default async function DocumentationPage({ params }) {
  const session = await getServerSession(authOptions);
  await connectMongo();
  
  // Get user with populated company
  const user = await User.findById(session.user.id).populate('company');
  
  const doc = await Documentation.findOne({
    company: user.company._id,
    slug: params.slug
  }).populate('creator');

  if (!doc) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">{doc.title}</h1>
            <Badge variant={doc.status === 'published' ? 'default' : 'secondary'}>
              {doc.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Created by {doc.creator.name}</span>
            <span>•</span>
            <span>Last updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {session?.user?.id === doc.creator._id.toString() && (
          <Link href={`/docs/${doc.slug}/edit`}>
            <Button variant="outline">Edit Documentation</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {doc.sections.map((section, index) => (
          <Card key={index} className="p-6">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <div className="prose max-w-none">
              {section.content.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
