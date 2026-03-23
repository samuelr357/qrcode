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
          <h1>Entrar</h1>
          <p className="muted">Acesse seu painel para liberar a geracao de QR.</p>
          {error ? <div className="alert error">{error}</div> : null}
          <form method="post" action="/api/auth/login" className="auth-form">
            <input type="hidden" name="next" value={next} />
            <label>Email<input type="email" name="email" required /></label>
            <label>Senha<input type="password" name="password" required /></label>
            <button className="btn" type="submit">Entrar</button>
          </form>
        </article>
      </section>
    </SiteShell>
  );
}
