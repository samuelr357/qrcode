# QR Studio Next.js

Migracao completa para Next.js com:

- landing page moderna
- login e cadastro
- pagina de precos
- painel admin com quantidade de usuarios
- sistema de permissoes (`ADMIN` e `USER`)
- pagamento Mercado Pago
- bloqueio de acesso ao gerador sem assinatura
- limite mensal de 30 QRs para usuario comum
- admin com geracao ilimitada
- termos de uso e politica LGPD
- Prisma + SQLite em dev
- gerador legado mantido com os mesmos recursos visuais/funcionais

## Rodar local

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run dev
```

Acesse: `http://localhost:3000`

## Rotas principais

- `/` landing
- `/pricing` precos
- `/login` login
- `/register` cadastro
- `/dashboard` painel do usuario
- `/admin` painel admin
- `/generator` gerador legado
- `/terms` termos de uso
- `/privacy` politica LGPD

## Mercado Pago

Configure `MERCADO_PAGO_ACCESS_TOKEN` no `.env`.
Sem token, o sistema usa modo de simulacao para desenvolvimento.
