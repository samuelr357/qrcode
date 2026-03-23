import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ActivateAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/ativar-adm");

  const adminsCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminsCount > 0) {
    notFound();
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: "ADMIN",
      subscriptionStatus: "ACTIVE",
      subscriptionEndsAt: null
    }
  });

  redirect("/admin?adminActivation=1");
}
