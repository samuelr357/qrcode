import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  const planPrice = Number(process.env.PLAN_PRICE || 29.9).toFixed(2).replace(".", ",");

  return (
    <SiteShell user={user}>
      <section className="section marketing-hero">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">QR Code para crescimento comercial</p>
            <h1>Converta materiais fisicos em vendas com QR Codes dinamicos e rastreaveis.</h1>
            <p className="lead">
              Crie campanhas em minutos, acompanhe resultados em tempo real e libere acesso por assinatura.
              Um produto pronto para vender com checkout e painel de administracao completos.
            </p>

            <div className="actions-row">
              <a className="btn" href={user ? "/generator" : "/register"}>
                {user ? "Criar QR Agora" : "Criar Conta Gratis"}
              </a>
              <a className="btn ghost" href="/pricing">Ver planos</a>
              <a className="btn ghost" href="/dashboard">Ver dashboard</a>
            </div>

            <div className="pill-row">
              <span>Teste e ative plano a partir de R$ {planPrice}/mes</span>
              <span>QR com logo, cor e estilo de marca</span>
              <span>Gestao de usuarios e assinatura</span>
              <span>Checkout integrado ao Mercado Pago</span>
            </div>
          </div>

          <aside className="hero-highlight">
            <h3>Painel orientado a receita</h3>
            <p className="muted">Acompanhe usuarios ativos, pagamentos aprovados e consumo de QR em um so lugar.</p>
            <div className="metrics">
              <div className="metric">
                <strong>+Vendas</strong>
                <small>Landing com foco em conversao</small>
              </div>
              <div className="metric">
                <strong>+Controle</strong>
                <small>Permissoes e modulos admin</small>
              </div>
              <div className="metric">
                <strong>+Escala</strong>
                <small>Operacao pronta para crescer</small>
              </div>
            </div>
          </aside>
        </div>

        <div className="trust-strip">
          <span>Usado por times de marketing, varejo, educacao, eventos e food service.</span>
          <div>
            <span>Campanhas Offline</span>
            <span>Menu Digital</span>
            <span>Cartao de Visita</span>
            <span>Catalogo e Promocoes</span>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Como funciona</p>
        <h2>Do primeiro QR a operacao comercial em 3 passos</h2>
        <div className="cards-3">
          <article className="feature-card">
            <h3>1. Escolha o tipo de QR</h3>
            <p>URL, WhatsApp, Wi-Fi, vCard, email e muito mais em uma interface simples.</p>
          </article>
          <article className="feature-card">
            <h3>2. Personalize para sua marca</h3>
            <p>Defina cores, formas, logo central e degrade para aumentar escaneamentos.</p>
          </article>
          <article className="feature-card">
            <h3>3. Venda e acompanhe resultados</h3>
            <p>Use assinatura para liberar acesso e monitore receita, usuarios e atividade no admin.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Recursos para vender mais</p>
        <h2>Tudo o que voce precisa para transformar QR em canal de receita</h2>
        <div className="cards-3">
          <article className="info-card">
            <h3>Experiencia premium de criacao</h3>
            <p className="muted">Gerador com preview, download em PNG/SVG e controles visuais completos.</p>
          </article>
          <article className="info-card">
            <h3>Modelo de assinatura pronto</h3>
            <p className="muted">Fluxo de checkout, webhook e liberacao de acesso automaticos.</p>
          </article>
          <article className="info-card">
            <h3>Painel admin com indicadores</h3>
            <p className="muted">Relatorios de usuarios, vendas, assinaturas e ranking de uso em tempo real.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Comparativo</p>
        <h2>Plano gratuito para entrar, plano PRO para escalar</h2>
        <div className="pricing-grid">
          <article className="pricing-card">
            <h3>Starter</h3>
            <p><strong>R$ 0</strong></p>
            <ul>
              <li>Cadastro e acesso ao dashboard</li>
              <li>Sem geracao de QR ate assinatura</li>
              <li>Ideal para testar a plataforma</li>
            </ul>
          </article>
          <article className="pricing-card">
            <h3>PRO</h3>
            <p><strong>R$ {planPrice}</strong> / mes</p>
            <ul>
              <li>30 geracoes mensais por usuario</li>
              <li>Painel com historico e consumo</li>
              <li>Checkout e controle de pagamento</li>
            </ul>
          </article>
          <article className="pricing-card">
            <h3>Admin</h3>
            <p><strong>Acesso interno</strong></p>
            <ul>
              <li>Uso ilimitado e governanca total</li>
              <li>Permissoes por modulo administrativo</li>
              <li>Relatorios de vendas e assinaturas</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section cta-section">
        <p className="eyebrow">Pronto para vender</p>
        <h2>Ative sua operacao de QR Code hoje</h2>
        <p className="lead">Suba sua base, monetize com assinatura e acompanhe tudo pelo painel admin.</p>
        <div className="actions-row">
          <a className="btn" href={user ? "/generator" : "/register"}>
            {user ? "Abrir gerador" : "Comecar agora"}
          </a>
          <a className="btn ghost" href="/pricing">Planos e precos</a>
        </div>
      </section>
    </SiteShell>
  );
}
