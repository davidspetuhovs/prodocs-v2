import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/libs/next-auth";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import User from "@/models/User";
import Company from "@/models/Company";
import Domain from "@/models/Domain";

export default async function DocumentationPage({ params }) {
  try {
    const session = await getServerSession(authOptions);
    const headersList = headers();
    const hostname = headersList.get("host");
     
    await connectMongo();

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'qalileo.com'
      : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

    let doc = null;
    let isAuthenticated = false;
    let company = null;

    // If authenticated user on main domain
    if (session && (hostname === baseUrl || hostname === `www.${baseUrl}`)) {
      isAuthenticated = true;
      const user = await User.findById(session.user.id).populate('company');
      
      if (user?.company) {
        company = user.company;
        doc = await Documentation.findOne({
          company: user.company._id,
          slug: params.slug
        }).populate('creator');
      }
    } else {
      // For public access (subdomain or custom domain)
      try {
        console.log('Checking hostname:', hostname);

        // First try to find by domain
        const domain = await Domain.findOne({ 
          domain: hostname,
          status: 'active'
        });
        console.log('Domain search result:', domain);

        if (domain) {
          console.log('Found domain, looking for company with domain ID:', domain._id);
          company = await Company.findOne({ domain: domain._id });
          console.log('Company found by domain:', company);
        } else if (hostname.endsWith(`.${baseUrl}`)) {
          // If no domain found, try subdomain
          const slug = hostname.replace(`.${baseUrl}`, '');
          console.log('No domain found, trying subdomain with slug:', slug);
          company = await Company.findOne({ slug });
          console.log('Company found by slug:', company);
        }

        if (company) {
          console.log('Found company:', company.name, 'ID:', company._id);
          doc = await Documentation.findOne({ 
            company: company._id,
            slug: params.slug,
            status: 'published'
          }).populate('creator');
          console.log('Found doc:', doc ? doc.title : null);
        } else {
          console.log('No company found for:', hostname);
        }

        if (company) {
          if (!doc) {
            console.log('No doc found for company:', company.name, 'with slug:', params.slug);
            notFound();
          }
        }
      } catch (error) {
        console.error('Error fetching company or doc:', error);
        // Continue with doc as null
      }
    }

    if (!doc) {
      notFound();
    }

    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">{doc.title}</h1>
              {isAuthenticated && (
                <Badge variant={doc.status === 'published' ? 'default' : 'secondary'}>
                  {doc.status}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Created by {doc.creator.name}</span>
              <span>•</span>
              <span>Last updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {isAuthenticated && session?.user?.id === doc.creator._id.toString() && (
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
  } catch (error) {
    console.error('Error in Documentation page:', error);
    return (
      <div className="container mx-auto py-10">
        <div className="text-center py-10 text-muted-foreground">
          Unable to load documentation. Please try again later.
        </div>
      </div>
    );
  }
}
