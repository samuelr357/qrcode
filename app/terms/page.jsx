import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";

export default async function TermsPage() {
  const user = await getCurrentUser();

  return (
    <SiteShell user={user}>
      <section className="section">
        <h1>Termos de Uso</h1>
        <p>Ao utilizar o QR Studio, voce concorda com os termos abaixo.</p>
        <h2>1. Objeto</h2>
        <p>Plataforma SaaS para criacao de QR Codes com area autenticada, recursos administrativos e integracao de pagamento.</p>
        <h2>2. Planos e cobranca</h2>
        <p>O acesso ao gerador para usuario comum depende de pagamento aprovado. O plano PRO permite ate 30 geracoes mensais. Admin e ilimitado.</p>
        <h2>3. Responsabilidade</h2>
        <p>E vedado usar a plataforma para conteudo ilicito, fraudulento ou que viole direitos de terceiros.</p>
      </section>
    </SiteShell>
  );
}
