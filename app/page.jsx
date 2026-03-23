import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <SiteShell user={user}>
      <section className="section">
        <p className="eyebrow">Plataforma completa com IA visual</p>
        <h1>Transforme cada link em um QR Code com identidade de marca e governanca.</h1>
        <p className="lead">Landing page premium, autenticacao, pagamentos Mercado Pago, painel admin e controle de permissoes em uma estrutura pronta para escalar.</p>
        <div className="actions-row">
          <a className="btn" href="/register">Criar conta</a>
          <a className="btn ghost" href="/pricing">Ver precos</a>
          {user ? <a className="btn ghost" href="/generator">Abrir gerador</a> : null}
        </div>
        <div className="pill-row">
          <span>30 QRs/mensais no plano PRO</span>
          <span>Admin ilimitado</span>
          <span>LGPD + Termos de uso</span>
        </div>
      </section>

      <section className="section">
        <h2>O que voce recebe</h2>
        <div className="cards-3">
          <article className="feature-card">
            <h3>Landing + Precos</h3>
            <p>Paginas com branding de alto nivel, copy comercial e jornada pronta para conversao.</p>
          </article>
          <article className="feature-card">
            <h3>Controle de perfis</h3>
            <p>Sistema de permissoes com perfis ADMIN e USER, regras de acesso e rastreio mensal.</p>
          </article>
          <article className="feature-card">
            <h3>Pagamento integrado</h3>
            <p>Conexao com Mercado Pago para desbloquear a area de geracao apos pagamento aprovado.</p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
