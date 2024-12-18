import { requireAuth } from "@/libs/check/auth-check";

export default async function LayoutPrivate({ children }) {
  await requireAuth();
  return children;
}