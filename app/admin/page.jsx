import { redirect } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [usersCount, activeUsersCount, adminsCount, qrCount, newUsersToday, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.qrGeneration.count(),
    prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, name: true, email: true, role: true, subscriptionStatus: true, createdAt: true }
    })
  ]);

  return (
    <SiteShell user={user}>
      <section className="section">
        <h1>Painel Administrativo</h1>
        <p className="lead">Visao geral da plataforma, usuarios e consumo.</p>
        <div className="stats-grid">
          <article><strong>{usersCount}</strong><small>Usuarios cadastrados</small></article>
          <article><strong>{activeUsersCount}</strong><small>Assinaturas ativas</small></article>
          <article><strong>{adminsCount}</strong><small>Administradores</small></article>
          <article><strong>{qrCount}</strong><small>QRs gerados</small></article>
        </div>

        <div className="cards-2">
          <article className="feature-card">
            <h3>Promover para admin</h3>
            <p>Conceda permissao admin e acesso ilimitado para um usuario.</p>
            <form className="auth-form" action="/api/admin/promote" method="post">
              <label>Email do usuario<input type="email" name="email" required placeholder="usuario@email.com" /></label>
              <button className="btn" type="submit">Promover</button>
            </form>
          </article>
          <article className="feature-card">
            <h3>Novos hoje</h3>
            <p><strong>{newUsersToday}</strong></p>
          </article>
        </div>

        <article className="table-wrap">
          <h3>Ultimos usuarios cadastrados</h3>
          <table>
            <thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Assinatura</th><th>Criado em</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td><span className="badge">{u.role}</span></td>
                  <td><span className={`badge ${u.subscriptionStatus === "ACTIVE" ? "ok" : ""}`}>{u.subscriptionStatus}</span></td>
                  <td>{new Date(u.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </SiteShell>
  );
}
