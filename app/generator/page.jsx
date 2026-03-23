import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";

export default async function GeneratorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/generator");

  const dashboard = await getDashboardData(user);
  if (!dashboard.hasAccess) redirect("/pricing?required=1");
  if (!dashboard.unlimited && dashboard.remaining <= 0) redirect("/dashboard?limit=1");

  const iframeSrc = `/legacy/index.html?unlimited=${dashboard.unlimited ? "1" : "0"}`;

  return (
    <div style={{ minHeight: "100vh" }}>
      <iframe
        title="Gerador QR"
        src={iframeSrc}
        style={{ border: 0, width: "100%", minHeight: "100vh", display: "block" }}
      />
    </div>
  );
}
