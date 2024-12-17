import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export default async function LayoutPrivate({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  // Check if user has completed onboarding
  await connectMongo();
  const user = await User.findById(session.user.id);
  const hasCompany = !!user?.company;

  if (!hasCompany) {
    redirect('/onboarding');
  }

  return children;
}