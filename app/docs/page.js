import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { headers } from "next/headers";
import connectMongo from "@/libs/mongoose";
import Documentation from "@/models/Documentation";
import User from "@/models/User";
import Company from "@/models/Company";
import Domain from "@/models/Domain"; // Added Domain model
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function Docs() {
  try {
    const session = await getServerSession(authOptions);
    const headersList = headers();
    const hostname = headersList.get("host");
    
    await connectMongo();

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'qalileo.com'
      : process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, "") || 'localhost:3000';

    let docs = [];
    let isAuthenticated = false;
    let company = null;

    // If authenticated user on main domain
    if (session && (hostname === baseUrl || hostname === `www.${baseUrl}`)) {
      isAuthenticated = true;
      const user = await User.findById(session.user.id).populate('company');
      
      if (user?.company) {
        company = user.company;
        docs = await Documentation.find({ company: user.company._id })
          .sort({ updatedAt: -1 })
          .select('title slug status updatedAt');
      }
    } else {
      // For public access (subdomain or custom domain)
      try {
        // First try custom domain
        const domain = await Domain.findOne({ 
          domain: hostname,
          status: 'active'
        });
        if (domain) {
          company = await Company.findOne().populate({
            path: 'domains',
            match: { _id: domain._id }
          });
        }

        // If not found and it's a subdomain, try subdomain
        if (!company && hostname.endsWith(`.${baseUrl}`)) {
          const slug = hostname.replace(`.${baseUrl}`, '');
          company = await Company.findOne({ slug });
        }

        // If still not found and it's a custom domain, try finding by domain
        if (!company && !hostname.endsWith(`.${baseUrl}`)) {
          // Try to find any active domain that matches
          const domains = await Domain.find({ 
            status: 'active',
            domain: { $regex: new RegExp(hostname.replace(/^docs\./, '')) }
          });
          
          if (domains.length > 0) {
            company = await Company.findOne().populate({
              path: 'domains',
              match: { _id: { $in: domains.map(d => d._id) } }
            });
          }
        }

        if (company) {
          docs = await Documentation.find({ 
            company: company._id,
            status: 'published'
          })
            .sort({ updatedAt: -1 })
            .select('title slug updatedAt');
        }
      } catch (error) {
        console.error('Error fetching company or docs:', error);
        // Continue with empty docs array
      }
    }

    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {company ? `${company.name} Documentation` : 'Documentation'}
          </h1>
          {isAuthenticated && (
            <Link href="/create-docs">
              <Button>Create New</Button>
            </Link>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <Link key={doc._id} href={`/docs/${doc.slug}`}>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <h2 className="font-semibold mb-2">{doc.title}</h2>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  {isAuthenticated && <span className="capitalize">{doc.status}</span>}
                  <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                </div>
              </Card>
            </Link>
          ))}

          {docs.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              {isAuthenticated 
                ? "No documentation found. Create your first documentation to get started."
                : "No published documentation available."
              }
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in Docs page:', error);
    return (
      <div className="container mx-auto py-10">
        <div className="text-center py-10 text-muted-foreground">
          Unable to load documentation. Please try again later.
        </div>
      </div>
    );
  }
}