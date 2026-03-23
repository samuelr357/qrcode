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
  const usagePercent = dashboard.unlimited
    ? 100
    : Math.max(0, Math.min(100, Math.round((dashboard.usedThisMonth / Math.max(dashboard.monthlyLimit, 1)) * 100)));
  const qrCells = Array.from({ length: 49 }, (_, index) => {
    const row = Math.floor(index / 7);
    const col = index % 7;
    const finderTopLeft = row <= 2 && col <= 2;
    const finderTopRight = row <= 2 && col >= 4;
    const finderBottomLeft = row >= 4 && col <= 2;
    const centerPattern = row >= 3 && col >= 3 && (row + col) % 2 === 0;
    const accent = (row === 3 && col === 5) || (row === 5 && col === 3) || (row === 6 && col === 6);
    return finderTopLeft || finderTopRight || finderBottomLeft || centerPattern || accent;
  });

  const alerts = [];
  if (paymentStatus === "success") alerts.push({ key: "success", type: "ok", text: "Pagamento aprovado. Seu acesso PRO esta ativo." });
  if (paymentStatus === "pending") alerts.push({ key: "pending", type: "warn", text: "Pagamento pendente. Aguarde confirmacao do Mercado Pago." });
  if (paymentStatus === "simulated") alerts.push({ key: "sim", type: "ok", text: "Modo desenvolvimento: assinatura ativada por simulacao." });
  if (limitFlag) alerts.push({ key: "limit", type: "warn", text: "Limite mensal atingido. Seu plano permite 30 QRs por mes." });

  return (
    <SiteShell user={user}>
      <section className="section dashboard-shell">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Painel do usuario</p>
            <h1>Dashboard QR Studio</h1>
            <p className="lead">
              Bem-vindo, <strong>{user.name}</strong>. Aqui voce acompanha plano, uso e acesso com foco total em operacao.
            </p>
            <div className="dashboard-meta">
              <span className={`badge ${dashboard.hasAccess ? "ok" : ""}`}>Plano: {dashboard.planLabel}</span>
              <span className={`badge ${dashboard.hasAccess ? "ok" : ""}`}>{dashboard.hasAccess ? "Acesso liberado" : "Acesso bloqueado"}</span>
              <span className="badge">{dashboard.unlimited ? "Conta sem limite mensal" : "Conta com limite mensal"}</span>
            </div>
          </div>
          <aside className="dashboard-matrix-card" aria-hidden="true">
            <div className="dashboard-matrix">
              {qrCells.map((isOn, index) => (
                <span key={index} className={`dashboard-matrix-cell ${isOn ? "is-on" : ""}`} />
              ))}
            </div>
            <small>QR Theme</small>
          </aside>
        </div>

        {alerts.map((alert) => (
          <div key={alert.key} className={`alert ${alert.type}`}>{alert.text}</div>
        ))}

        <div className="dashboard-kpi-grid">
          <article className="dashboard-kpi-card">
            <small>Plano atual</small>
            <strong>{dashboard.planLabel}</strong>
            <p>{dashboard.unlimited ? "Conta com privilegio administrativo" : "Plano orientado a produtividade"}</p>
          </article>
          <article className="dashboard-kpi-card">
            <small>Status de acesso</small>
            <strong>{dashboard.hasAccess ? "Ativo" : "Bloqueado"}</strong>
            <p>{dashboard.hasAccess ? "Gerador liberado para criar QRs" : "Ative o plano para gerar novos QRs"}</p>
          </article>
          <article className="dashboard-kpi-card">
            <small>Uso mensal</small>
            <strong>{dashboard.unlimited ? "Ilimitado" : `${dashboard.usedThisMonth}/${dashboard.monthlyLimit}`}</strong>
            <p>{dashboard.unlimited ? "Sem restricao de volume" : `${usagePercent}% do limite mensal utilizado`}</p>
          </article>
          <article className="dashboard-kpi-card">
            <small>Saldo restante</small>
            <strong>{dashboard.unlimited ? "INF" : dashboard.remaining}</strong>
            <p>{dashboard.unlimited ? "Disponibilidade total para operacao" : "Geracoes disponiveis para este mes"}</p>
          </article>
        </div>

        <div className="dashboard-layout">
          <article className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h3>Consumo de QR no mes</h3>
              <strong>{dashboard.unlimited ? "100%" : `${usagePercent}%`}</strong>
            </div>
            <div className="dashboard-progress" role="img" aria-label={`Consumo do mes: ${usagePercent}%`}>
              <span style={{ width: `${dashboard.unlimited ? 100 : usagePercent}%` }} />
            </div>
            <p className="muted">
              {dashboard.unlimited
                ? "Sua conta tem uso ilimitado. Continue criando sem bloqueios."
                : `Voce ja utilizou ${dashboard.usedThisMonth} geracoes e ainda possui ${dashboard.remaining} disponiveis.`}
            </p>
            <ul className="dashboard-list">
              <li>Plano: {dashboard.planLabel}</li>
              <li>Acesso ao gerador: {dashboard.hasAccess ? "Liberado" : "Bloqueado"}</li>
              <li>Limite mensal: {dashboard.unlimited ? "Ilimitado" : dashboard.monthlyLimit}</li>
            </ul>
          </article>

          <article className="dashboard-panel">
            <h3>Acoes rapidas</h3>
            <p className="muted">Ative seu fluxo de criacao e mantenha seu plano sempre em dia.</p>
            <div className="dashboard-actions">
              {dashboard.hasAccess ? <a className="btn" href="/generator">Ir para o gerador</a> : <PayButton label="Ativar plano PRO" />}
              <a className="btn ghost" href="/pricing">Ver planos</a>
              {canAccessAdminPanel(user) ? <a className="btn ghost" href="/admin">Abrir admin</a> : null}
            </div>
            <div className="dashboard-step-grid">
              <div>
                <strong>1</strong>
                <span>Crie ou atualize seu QR com identidade visual</span>
              </div>
              <div>
                <strong>2</strong>
                <span>Baixe em PNG ou SVG para campanhas e materiais</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Gerencie assinatura e acompanhe performance</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
