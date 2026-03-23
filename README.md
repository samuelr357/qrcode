# QR Studio

Projeto web para geração de QR Code em tempo real, com personalização de estilo, cores, logo e resolução.

## Rodar com Docker (producao)

```bash
docker compose up --build
```

Abra `http://localhost:5540`.

## Rodar com Docker (desenvolvimento)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Abra `http://localhost:8080`.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Deploy automatico de um projeto no GitHub

Use este comando para buildar e subir direto de um repositorio remoto:

```bash
./deploy-github.sh https://github.com/usuario/projeto.git main 5540
```

Ou sem script:

```bash
GIT_REPO="https://github.com/usuario/projeto.git#main" APP_PORT=5540 docker compose -f docker-compose.github.yml up --build -d
```

Notas:
- O repositorio remoto precisa ter `Dockerfile` na raiz (ou defina `GIT_DOCKERFILE`).
- Para repositorio privado, configure autenticacao do Docker/Git no host antes de rodar.
