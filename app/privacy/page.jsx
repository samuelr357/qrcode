import SiteShell from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";

export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <SiteShell user={user}>
      <section className="section">
        <h1>Politica de Privacidade e LGPD</h1>
        <p>Tratamos dados pessoais conforme a Lei Geral de Protecao de Dados (Lei n. 13.709/2018).</p>
        <h2>Dados coletados</h2>
        <p>Nome, email, hash de senha, aceite de termos, logs de geracao de QR e metadados de pagamento.</p>
        <h2>Finalidade</h2>
        <p>Autenticacao, controle de permissoes, processamento de assinatura, seguranca e cumprimento legal.</p>
        <h2>Direitos do titular</h2>
        <p>Acesso, correcao, portabilidade e eliminacao, conforme hipoteses legais aplicaveis.</p>
      </section>
    </SiteShell>
  );
}
