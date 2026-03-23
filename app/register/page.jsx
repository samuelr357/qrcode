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
          <h1>Criar conta</h1>
          <p className="muted">Comece com onboarding completo e pronto para assinatura.</p>
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
        </article>
      </section>
    </SiteShell>
  );
}
