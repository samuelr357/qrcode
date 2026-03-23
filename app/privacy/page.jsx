import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";

export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <SiteShell user={user}>
      <section className="section">
        <p className="eyebrow">LGPD</p>
        <h1>Politica de Privacidade e LGPD</h1>
        <p>Tratamos dados pessoais conforme a Lei Geral de Protecao de Dados (Lei n. 13.709/2018).</p>
        <h2>Dados coletados</h2>
        <p>Nome, email, hash de senha, aceite de termos, logs de geracao de QR e metadados de pagamento.</p>
        <h2>Finalidade</h2>
        <p>Autenticacao, controle de permissoes, processamento de assinatura, seguranca e cumprimento legal.</p>
        <h2>Base legal</h2>
        <p>Execucao contratual, cumprimento de obrigacao legal/regulatoria e legitimo interesse para seguranca e prevencao a fraude.</p>
        <h2>Retencao e seguranca</h2>
        <p>Os dados sao mantidos pelo periodo necessario a prestacao do servico e obrigacoes legais, com medidas tecnicas de seguranca e controle de acesso.</p>
        <h2>Direitos do titular</h2>
        <p>Acesso, correcao, portabilidade e eliminacao, conforme hipoteses legais aplicaveis.</p>
        <h2>Contato do controlador</h2>
        <p>Solicitacoes relacionadas a dados pessoais podem ser feitas pelo canal oficial de suporte informado pela empresa.</p>
      </section>
    </SiteShell>
  );
}
