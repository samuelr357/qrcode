import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const error = params?.error || null;
  const next = params?.next || "";

  return (
    <SiteShell user={null}>
      <section className="auth-shell">
        <article className="auth-card">
          <div className="auth-grid">
            <div>
              <p className="eyebrow">Acesso a plataforma</p>
              <h1>Entrar</h1>
              <p className="muted">Acesse seu painel para liberar ou gerenciar sua assinatura do gerador.</p>
              {error ? <div className="alert error">{error}</div> : null}
              <form method="post" action="/api/auth/login" className="auth-form">
                <input type="hidden" name="next" value={next} />
                <label>Email<input type="email" name="email" required /></label>
                <label>Senha<input type="password" name="password" required /></label>
                <button className="btn" type="submit">Entrar</button>
              </form>
            </div>
            <aside className="auth-side">
              <h2>Ao entrar voce pode</h2>
              <ul>
                <li>Ativar seu plano PRO e liberar o gerador.</li>
                <li>Acompanhar consumo mensal de QR em tempo real.</li>
                <li>Gerenciar acesso administrativo (se perfil ADMIN).</li>
              </ul>
            </aside>
          </div>
        </article>
      </section>
    </SiteShell>
  );
}
