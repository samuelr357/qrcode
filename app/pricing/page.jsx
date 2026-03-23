import SiteShell from "@/components/SiteShell";
import PayButton from "@/components/PayButton";
import { getCurrentUser } from "@/lib/auth";
import { mercadoPagoEnabled } from "@/lib/mercado-pago";

export default async function PricingPage({ searchParams }) {
  const user = await getCurrentUser();
  const required = (await searchParams)?.required === "1";
  const price = Number(process.env.PLAN_PRICE || 29.9);

  return (
    <SiteShell user={user}>
      <section className="section">
        <h1>Planos e acesso</h1>
        <p className="lead">Para gerar QR Code na plataforma, o usuario comum precisa ter assinatura ativa.</p>
        {required ? <div className="alert warn">Voce precisa assinar o plano para acessar o gerador.</div> : null}

        <div className="cards-2">
          <article className="pricing-card">
            <h3>Visitante</h3>
            <p><strong>R$ 0</strong></p>
            <ul>
              <li>Cadastro e login</li>
              <li>Acesso ao dashboard</li>
              <li>Sem geracao de QR ate pagamento</li>
            </ul>
            <a className="btn ghost" href="/register">Criar conta</a>
          </article>

          <article className="pricing-card">
            <h3>PRO Mensal</h3>
            <p><strong>R$ {price.toFixed(2).replace(".", ",")}</strong> / mes</p>
            <ul>
              <li>30 geracoes de QR por mes por usuario</li>
              <li>Painel de consumo e historico</li>
              <li>Checkout Mercado Pago integrado</li>
            </ul>
            {!user ? <a className="btn" href="/login">Entrar para assinar</a> : null}
            {user?.role === "ADMIN" ? <span className="badge ok">Conta admin com uso ilimitado</span> : null}
            {user && user.role !== "ADMIN" ? <PayButton /> : null}
            {!mercadoPagoEnabled() ? <small className="muted">Modo dev: pagamento simulado (sem token Mercado Pago).</small> : null}
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
