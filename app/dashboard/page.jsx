import { redirect } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import PayButton from "@/components/PayButton";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { canAccessAdminPanel } from "@/lib/permissions";

export default async function DashboardPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const dashboard = await getDashboardData(user);
  const params = await searchParams;
  const paymentStatus = params?.payment || "";
  const limitFlag = params?.limit === "1";

  return (
    <SiteShell user={user}>
      <section className="section">
        <p className="eyebrow">Painel do usuario</p>
        <h1>Dashboard</h1>
        <p className="lead">Bem-vindo, <strong>{user.name}</strong>. Gerencie plano, acesso e consumo de QR.</p>
        {paymentStatus === "success" ? <div className="alert ok">Pagamento aprovado. Seu acesso PRO esta ativo.</div> : null}
        {paymentStatus === "pending" ? <div className="alert warn">Pagamento pendente. Aguarde confirmacao do Mercado Pago.</div> : null}
        {paymentStatus === "simulated" ? <div className="alert ok">Modo desenvolvimento: assinatura ativada por simulacao.</div> : null}
        {limitFlag ? <div className="alert warn">Limite mensal atingido. Seu plano permite 30 QRs por mes.</div> : null}

        <div className="stats-grid">
          <article><strong>{dashboard.planLabel}</strong><small>Plano atual</small></article>
          <article><strong>{dashboard.hasAccess ? "Ativo" : "Bloqueado"}</strong><small>Acesso ao gerador</small></article>
          <article><strong>{dashboard.unlimited ? "Ilimitado" : `${dashboard.usedThisMonth}/${dashboard.monthlyLimit}`}</strong><small>Uso mensal</small></article>
          <article><strong>{dashboard.unlimited ? "INF" : dashboard.remaining}</strong><small>Saldo restante</small></article>
        </div>

        <div className="actions-row">
          {dashboard.hasAccess ? <a className="btn" href="/generator">Ir para o gerador</a> : <PayButton label="Ativar plano PRO" />}
          <a className="btn ghost" href="/pricing">Ver planos</a>
          {canAccessAdminPanel(user) ? <a className="btn ghost" href="/admin">Abrir admin</a> : null}
        </div>
      </section>
    </SiteShell>
  );
}
