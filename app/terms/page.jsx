import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";

export default async function TermsPage() {
  const user = await getCurrentUser();

  return (
    <SiteShell user={user}>
      <section className="section">
        <p className="eyebrow">Juridico</p>
        <h1>Termos de Uso</h1>
        <p>Ao utilizar o QR Studio, voce concorda com os termos abaixo, incluindo regras de acesso, assinatura e responsabilidade de uso.</p>
        <h2>1. Objeto</h2>
        <p>Plataforma SaaS para criacao de QR Codes com area autenticada, recursos administrativos e integracao de pagamento.</p>
        <h2>2. Planos e cobranca</h2>
        <p>O acesso ao gerador para usuario comum depende de pagamento aprovado. O plano PRO permite ate 30 geracoes mensais por conta USER. O perfil ADMIN possui uso ilimitado.</p>
        <h2>3. Responsabilidade</h2>
        <p>E vedado usar a plataforma para conteudo ilicito, fraudulento, ofensivo, com malware ou que viole direitos de terceiros. O usuario e integralmente responsavel pelo conteudo codificado.</p>
        <h2>4. Disponibilidade e suporte</h2>
        <p>Buscamos alta disponibilidade, mas nao garantimos operacao ininterrupta. Manutencoes e indisponibilidades podem ocorrer por razoes tecnicas ou de seguranca.</p>
        <h2>5. Suspensao e cancelamento</h2>
        <p>Podemos suspender ou encerrar contas em caso de violacao destes termos, fraude, uso abusivo da plataforma ou determinacao legal.</p>
      </section>
    </SiteShell>
  );
}
