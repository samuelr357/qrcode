import Link from "next/link";

export default function SiteShell({ user, children }) {
  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-badge">QR</span>
          <span>
            <strong>QR Studio</strong>
            <small>Branding + Performance</small>
          </span>
        </Link>
        <nav>
          <Link href="/pricing">Precos</Link>
          <Link href="/terms">Termos</Link>
          <Link href="/privacy">LGPD</Link>
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              {user.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
              <form action="/api/auth/logout" method="post">
                <button className="btn ghost" type="submit">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Entrar</Link>
              <Link className="btn mini" href="/register">
                Comecar
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <p>(c) {new Date().getFullYear()} QR Studio. Plataforma com controle de acesso e pagamentos.</p>
        <div>
          <Link href="/terms">Termos</Link>
          <Link href="/privacy">Privacidade</Link>
        </div>
      </footer>
    </>
  );
}
