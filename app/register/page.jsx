import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const error = params?.error || null;

  return (
    <SiteShell user={null}>
      <section className="auth-shell">
        <article className="auth-card">
          <div className="auth-grid">
            <div>
              <p className="eyebrow">Comece agora</p>
              <h1>Criar conta</h1>
              <p className="muted">Onboarding rapido para assinar e desbloquear o gerador profissional.</p>
              {error ? <div className="alert error">{error}</div> : null}
              <form method="post" action="/api/auth/register" className="auth-form">
                <label>Nome<input type="text" name="name" required /></label>
                <label>Email<input type="email" name="email" required /></label>
                <label>Senha<input type="password" name="password" minLength="6" required /></label>
                <label className="checkbox-row">
                  <input type="checkbox" name="acceptedTerms" required />
                  <span>Li e aceito os <a href="/terms" target="_blank">Termos de Uso</a>.</span>
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" name="acceptedPrivacy" required />
                  <span>Li e aceito a <a href="/privacy" target="_blank">Politica de Privacidade (LGPD)</a>.</span>
                </label>
                <button className="btn" type="submit">Criar conta</button>
              </form>
            </div>
            <aside className="auth-side">
              <h2>O que esta incluso</h2>
              <ul>
                <li>Login seguro com hash de senha.</li>
                <li>Plano PRO com checkout Mercado Pago.</li>
                <li>Limite de 30 geracoes mensais para perfil USER.</li>
                <li>Conta ADMIN com uso ilimitado.</li>
              </ul>
            </aside>
          </div>
        </article>
      </section>
    </SiteShell>
  );
}
