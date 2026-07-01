import { IdeaDetailClient } from "@/components/garage/IdeaDetailClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function IdeaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <IdeaDetailClient ideaId={params.id} />;
}
