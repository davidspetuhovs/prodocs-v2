import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../next-auth";
import config from "@/config";

//only check Auth

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  return session;
}

//check Auth and Company
export async function requireCompany() {
  const session = await requireAuth();

  if (!session.user.company) {
    redirect("/onboarding");
  }

  return session;
}
