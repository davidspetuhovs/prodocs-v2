import { requireCompany } from "@/libs/check/auth-check";

export default async function LayoutPrivate({ children }) {
  await requireCompany();
  return children;
}