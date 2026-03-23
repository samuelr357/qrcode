import Link from "next/link";
import { redirect } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";
import { getAdminDashboardData, getAvailableRanges } from "@/lib/admin-dashboard";
import { canAccessAdminPanel, hasPermission, PERMISSIONS } from "@/lib/permissions";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

const formatPercent = (value) => `${Number(value || 0).toFixed(1).replace(".", ",")}%`;

const readRange = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 30;
};

const getUpdateMessage = (status) => {
  if (status === "ok") return { type: "ok", text: "Atualizacao aplicada com sucesso." };
  if (status === "invalid") return { type: "error", text: "Dados invalidos para a atualizacao." };
  if (status === "not_found") return { type: "error", text: "Usuario nao encontrado para o email informado." };
  if (status === "forbidden") return { type: "error", text: "Voce nao possui permissao para essa operacao." };
  if (status === "self_downgrade") return { type: "error", text: "Voce nao pode remover seu proprio acesso administrativo." };
  if (status === "last_admin") return { type: "error", text: "Nao e permitido remover o ultimo admin do sistema." };
  return null;
};

export default async function AdminPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!canAccessAdminPanel(user)) redirect("/dashboard");

  const params = await searchParams;
  const selectedRange = readRange(params?.range);
  const ranges = getAvailableRanges();
  const data = await getAdminDashboardData({ rangeDays: selectedRange });
  const updateMessage = getUpdateMessage(params?.updated);
  const adminActivationDone = params?.adminActivation === "1";

  const permissions = {
    usersView: hasPermission(user, PERMISSIONS.USERS_VIEW),
    usersManage: hasPermission(user, PERMISSIONS.USERS_MANAGE),
    salesView: hasPermission(user, PERMISSIONS.SALES_VIEW),
    subscriptionsView: hasPermission(user, PERMISSIONS.SUBSCRIPTIONS_VIEW),
    reportsView: hasPermission(user, PERMISSIONS.REPORTS_VIEW)
  };

  return (
    <SiteShell user={user}>
      <section className="section admin-shell">
        <p className="eyebrow">Admin Intelligence</p>
        <h1>Painel Administrativo Completo</h1>
        <p className="lead">
          Visao executiva da operacao: usuarios, vendas, assinatura e performance de uso em um unico painel.
        </p>

        <div className="actions-row admin-range-row">
          {ranges.map((range) => {
            const isActive = range === data.rangeDays;
            return (
              <Link key={range} className={`badge ${isActive ? "ok" : ""}`} href={`/admin?range=${range}`}>
                Ultimos {range} dias
              </Link>
            );
          })}
        </div>

        {adminActivationDone ? (
          <div className="alert ok">Conta administrativa raiz ativada com sucesso para este sistema.</div>
        ) : null}
        {updateMessage ? <div className={`alert ${updateMessage.type}`}>{updateMessage.text}</div> : null}

        <div className="stats-grid">
          <article>
            <strong>{data.users.total}</strong>
            <small>Usuarios totais</small>
          </article>
          <article>
            <strong>{data.users.newInRange}</strong>
            <small>Novos usuarios ({data.rangeDays}d)</small>
          </article>
          <article>
            <strong>{data.users.newToday}</strong>
            <small>Cadastros hoje</small>
          </article>
          <article>
            <strong>{data.qr.inRange}</strong>
            <small>QRs gerados ({data.rangeDays}d)</small>
          </article>
        </div>

        <div className="cards-3">
          {permissions.salesView ? (
            <article className="feature-card">
              <h3>Receita</h3>
              <p className="muted">Faturamento aprovado no periodo e acumulado.</p>
              <p><strong>{formatCurrency(data.sales.rangeRevenue)}</strong></p>
              <p className="muted">Periodo selecionado</p>
              <p><strong>{formatCurrency(data.sales.lifetimeRevenue)}</strong></p>
              <p className="muted">Receita total acumulada</p>
            </article>
          ) : null}

          {permissions.subscriptionsView ? (
            <article className="feature-card">
              <h3>Assinaturas</h3>
              <p className="muted">Saude da base pagante e risco de churn.</p>
              <ul>
                <li>Ativas: {data.subscriptions.active}</li>
                <li>Pendentes: {data.subscriptions.pending}</li>
                <li>Inativas: {data.subscriptions.inactive}</li>
                <li>Expiram em 7 dias: {data.subscriptions.expiringSoon}</li>
              </ul>
              <p className="muted">
                MRR estimado: <strong>{formatCurrency(data.subscriptions.mrrEstimate)}</strong>
              </p>
            </article>
          ) : null}

          {permissions.reportsView ? (
            <article className="feature-card">
              <h3>Conversao</h3>
              <p className="muted">Indicadores operacionais do funil comercial.</p>
              <ul>
                <li>Taxa de aprovacao: {formatPercent(data.sales.approvalRate)}</li>
                <li>Base ativa: {formatPercent(data.subscriptions.activeRatio)}</li>
                <li>Admins na base: {formatPercent(data.users.adminsRatio)}</li>
                <li>Pagamentos aprovados: {data.sales.lifetimeApprovedCount}</li>
              </ul>
            </article>
          ) : null}
        </div>

        {permissions.salesView ? (
          <article className="feature-card">
            <h3>Receita dos ultimos 6 meses</h3>
            <div className="report-bars">
              {data.sales.revenueSeries.map((item) => {
                const maxValue = Math.max(...data.sales.revenueSeries.map((row) => row.value), 1);
                const width = Math.max(6, Math.round((item.value / maxValue) * 100));
                return (
                  <div key={item.key} className="report-bar-row">
                    <span>{item.label}</span>
                    <div className="report-bar-track">
                      <div className="report-bar-fill" style={{ width: `${width}%` }} />
                    </div>
                    <strong>{formatCurrency(item.value)}</strong>
                  </div>
                );
              })}
            </div>
          </article>
        ) : null}

        <div className="cards-2">
          {permissions.usersManage ? (
            <article className="feature-card">
              <h3>Permissoes e acessos</h3>
              <p className="muted">Gerencie perfil e assinatura da conta sem acessar o banco manualmente.</p>

              <form className="auth-form" action="/api/admin/users/update" method="post">
                <input type="hidden" name="action" value="setRole" />
                <input type="hidden" name="range" value={String(data.rangeDays)} />
                <label>
                  Email do usuario
                  <input type="email" name="email" required placeholder="usuario@empresa.com" />
                </label>
                <label>
                  Perfil
                  <select name="role" defaultValue="USER">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>
                <button className="btn" type="submit">Atualizar perfil</button>
              </form>

              <form className="auth-form" action="/api/admin/users/update" method="post">
                <input type="hidden" name="action" value="setSubscription" />
                <input type="hidden" name="range" value={String(data.rangeDays)} />
                <label>
                  Email do usuario
                  <input type="email" name="email" required placeholder="usuario@empresa.com" />
                </label>
                <label>
                  Status da assinatura
                  <select name="subscriptionStatus" defaultValue="ACTIVE">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </label>
                <button className="btn ghost" type="submit">Atualizar assinatura</button>
              </form>
            </article>
          ) : null}

          {permissions.reportsView ? (
            <article className="feature-card">
              <h3>Relatorio rapido</h3>
              <ul>
                <li>Receita aprovada ({data.rangeDays}d): {formatCurrency(data.sales.rangeRevenue)}</li>
                <li>Receita pendente ({data.rangeDays}d): {formatCurrency(data.sales.rangePendingAmount)}</li>
                <li>Receita recusada/cancelada: {formatCurrency(data.sales.rangeFailedAmount)}</li>
                <li>Total de vendas no periodo: {data.sales.totalCount}</li>
                <li>QRs acumulados na plataforma: {data.qr.total}</li>
              </ul>
            </article>
          ) : null}
        </div>

        {permissions.usersView ? (
          <article className="table-wrap">
            <h3>Ultimos usuarios cadastrados</h3>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Assinatura</th>
                  <th>Expira em</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {data.users.recent.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td><span className="badge">{item.role}</span></td>
                    <td>
                      <span className={`badge ${item.subscriptionStatus === "ACTIVE" ? "ok" : ""}`}>
                        {item.subscriptionStatus}
                      </span>
                    </td>
                    <td>{item.subscriptionEndsAt ? new Date(item.subscriptionEndsAt).toLocaleDateString("pt-BR") : "-"}</td>
                    <td>{new Date(item.createdAt).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ) : null}

        {permissions.salesView ? (
          <article className="table-wrap">
            <h3>Ultimas vendas e cobrancas</h3>
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Plano</th>
                  <th>Valor</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {data.sales.recentPayments.map((item) => (
                  <tr key={item.id}>
                    <td>{item.user?.name || "-"}</td>
                    <td>{item.user?.email || "-"}</td>
                    <td>
                      <span className={`badge ${item.status === "APPROVED" ? "ok" : ""}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.plan}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{new Date(item.createdAt).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ) : null}

        {permissions.reportsView ? (
          <article className="table-wrap">
            <h3>Top usuarios por geracao de QR ({data.rangeDays}d)</h3>
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>QRs no periodo</th>
                </tr>
              </thead>
              <tbody>
                {data.qr.topUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3}>Sem geracoes no periodo selecionado.</td>
                  </tr>
                ) : (
                  data.qr.topUsers.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.qrCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </article>
        ) : null}
      </section>
    </SiteShell>
  );
}
