# APP DO CONSULTOR — Success Roadmap System

Sistema de acompanhamento de consultoria de RH que transforma 12 encontros quinzenais em marcos de progresso visíveis.

## Stack

- **Framework:** [Astro](https://astro.build) com SSR (Node adapter)
- **UI:** React Islands + Tailwind CSS
- **Backend/DB:** [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage)
- **Deploy:** Vercel / Netlify

## Módulos

- 🚦 **Visão Semáforo** — Dashboard do consultor com status 🔴/🟢 por empresa
- 📍 **Roadmap de 12 Encontros** — Timeline interativa com checkpoints e notas
- 📋 **Central de Pendências** — TO-DO list por encontro (consultor cria, cliente executa)
- 🗄️ **Cofre de Documentos** — Upload seguro via Supabase Storage (consultor e cliente)

## Setup Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# edite .env com suas chaves do Supabase

# Rodar em desenvolvimento
npm run dev
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

## Deploy

O projeto usa o adapter `@astrojs/node` em modo `standalone`.
Compatível com Vercel, Netlify e qualquer host Node.js.

Configure as variáveis de ambiente no painel do seu serviço de deploy.
