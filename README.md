# Cupcake Commerce

E-commerce de cupcakes desenvolvido com Next.js, Supabase, Drizzle ORM, Shadcn/ui e Tailwind CSS.

## Arquitetura MVC

Este projeto segue o padrão MVC (Model-View-Controller):

### Models (`src/models/`)

Contém a lógica de acesso aos dados e interação com o banco de dados:

- `user.model.ts` - Gerenciamento de usuários
- `cupcake.model.ts` - Gerenciamento de produtos
- `category.model.ts` - Gerenciamento de categorias
- `cart.model.ts` - Gerenciamento do carrinho
- `order.model.ts` - Gerenciamento de pedidos
- `address.model.ts` - Gerenciamento de endereços
- `coupon.model.ts` - Gerenciamento de cupons
- `review.model.ts` - Gerenciamento de avaliações
- `notification.model.ts` - Gerenciamento de notificações

### Controllers (`src/controllers/`)

Contém a lógica de negócio e coordenação entre models e views:

- `cart.controller.ts` - Lógica do carrinho
- `order.controller.ts` - Lógica de pedidos
- `payment.controller.ts` - Processamento de pagamentos (mock)
- `coupon.controller.ts` - Validação de cupons
- `review.controller.ts` - Lógica de avaliações
- `profile.controller.ts` - Gerenciamento de perfil
- `product.controller.ts` - Lógica de produtos

### Views (`src/app/` e `src/components/`)

Contém os componentes React e páginas da aplicação:

- `src/app/` - Páginas Next.js (App Router)
- `src/components/` - Componentes reutilizáveis

### API Routes (`src/app/api/`)

Rotas da API que utilizam os controllers:

- Todas as rotas em `src/app/api/` delegam para os controllers apropriados

## Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Supabase** - Backend (Auth + Database)
- **Drizzle ORM** - ORM para PostgreSQL
- **Shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Zod** - Validação de schemas
- **React Hook Form** - Gerenciamento de formulários

## Configuração

1. Instale as dependências:

```bash
pnpm install
```

2. Configure as variáveis de ambiente em `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://user:password@host:port/database
```

3. Aplique o schema ao banco de dados (desenvolvimento local):

```bash
# Gere migrações a partir do schema
pnpm db:generate  # Gera arquivos de migração em drizzle/

# Aplique as migrações ao banco local
pnpm db:migrate   # Aplica migrações ao banco local
```

**Nota:** Para produção, as migrações são aplicadas automaticamente via GitHub Actions quando você faz push para `main`.

4. Popule o banco com dados iniciais:

```bash
# Para desenvolvimento local (limpa dados existentes)
pnpm db:seed

# Para produção remota, use o GitHub Actions workflow:
# Actions → Seed Supabase Database → Run workflow
```

5. Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

## Scripts Disponíveis

- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Cria build de produção
- `pnpm start` - Inicia servidor de produção
- `pnpm lint` - Executa ESLint
- `pnpm format` - Formata código com Prettier
- `pnpm typecheck` - Verifica tipos TypeScript
- `pnpm test` - Executa testes unitários
- `pnpm test:ui` - Abre interface visual de testes
- `pnpm test:coverage` - Gera relatório de cobertura
- `pnpm db:generate` - Gera migrações a partir do schema (apenas desenvolvimento local)
- `pnpm db:migrate` - Aplica migrações ao banco (apenas desenvolvimento local)
- `pnpm db:studio` - Abre Drizzle Studio para visualizar o banco
- `pnpm db:seed` - Popula banco com dados iniciais

## Funcionalidades

- ✅ Autenticação de usuários (Supabase Auth)
- ✅ Catálogo de produtos com filtros e busca
- ✅ Carrinho de compras
- ✅ Checkout com endereço e método de entrega
- ✅ Aplicação de cupons de desconto
- ✅ Processamento de pagamento (mock)
- ✅ Histórico de pedidos
- ✅ Cancelamento de pedidos
- ✅ Avaliações e reviews de produtos
- ✅ Gerenciamento de perfil e endereços
- ✅ Página de suporte

## Workflow do Banco de Dados

Este projeto usa **Drizzle ORM** com migrações versionadas. O workflow difere entre desenvolvimento local e produção.

### Desenvolvimento Local

Para desenvolvimento local, use o workflow de migrações:

```bash
# 1. Edite os arquivos de schema em src/lib/db/schema/
# 2. Gere arquivos de migração
pnpm db:generate

# 3. Revise os arquivos gerados em drizzle/
# 4. Aplique as migrações ao banco local
pnpm db:migrate
```

### Produção (Supabase Remote)

As migrações para produção são aplicadas automaticamente via **GitHub Actions** quando você faz push para `main`:

1. **Edite os arquivos de schema** em `src/lib/db/schema/`
2. **Gere migrações localmente** (opcional, para revisar):
   ```bash
   pnpm db:generate
   ```
3. **Commit e push** para `main`:
   ```bash
   git add src/lib/db/schema/ drizzle/
   git commit -m "feat: add new field to users table"
   git push origin main
   ```
4. **GitHub Actions** automaticamente:
   - Linka ao projeto Supabase
   - Sincroniza migrações remotas (`supabase db pull`)
   - Aplica migrações ao Supabase (`supabase db push`)

### Configuração do GitHub Actions

Para que as migrações automáticas funcionem, configure os seguintes secrets no GitHub:

1. `SUPABASE_ACCESS_TOKEN` - Token de acesso do Supabase
   - Obtenha em: https://supabase.com/dashboard/account/tokens
   - Crie um novo token se necessário
   
2. `SUPABASE_PROJECT_REF` - Reference ID (ID de Referência) do projeto Supabase
   - **O que é:** Identificador único do projeto (não é o Project ID)
   - **Onde encontrar:**
     - Dashboard → Settings → General → "Reference ID"
     - Ou na URL do projeto: `https://supabase.com/dashboard/project/<reference-id>`
   - **Formato:** Código alfanumérico (ex: `abcdefghijklmnop`)
   - **Exemplo:** Se sua URL é `https://supabase.com/dashboard/project/abc123xyz`, então `abc123xyz` é o seu `SUPABASE_PROJECT_REF`

### Seeding do Banco de Dados

Para popular o banco de dados remoto com dados iniciais (produtos, categorias, etc.):

**Via GitHub Actions (recomendado para produção):**
1. Acesse **Actions** → **Seed Supabase Database**
2. Clique em **Run workflow**
3. Escolha se deseja limpar dados existentes (padrão: não limpa)
4. Execute o workflow

**Secrets necessários:**
- `DATABASE_URL`: Connection string completa do banco remoto
  - Obtenha em: Dashboard → Settings → Database → Connection string → URI
  - Copie a connection string completa e adicione como secret `DATABASE_URL` no GitHub
  - **Dica:** Use a mesma `DATABASE_URL` do seu `.env.local` mas com a senha do banco remoto

**Local (desenvolvimento):**
```bash
# Limpa dados existentes e adiciona novos
pnpm db:seed

# Para não limpar dados existentes:
CLEAR_EXISTING=false pnpm db:seed
```

### Estrutura de Migrações

- **Schema**: `src/lib/db/schema/` - Definições TypeScript do schema
- **Migrações**: `drizzle/` - Arquivos SQL de migração gerados
- **Seed**: `drizzle/seed.ts` - Script de seeding do banco
- **Config**: `drizzle.config.ts` - Configuração do Drizzle Kit

## Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router (Views)
│   ├── (auth)/            # Rotas de autenticação
│   ├── (shop)/            # Rotas da loja
│   └── api/               # API Routes (usam Controllers)
├── components/            # Componentes React (Views)
│   ├── ui/               # Componentes Shadcn
│   ├── layout/           # Componentes de layout
│   ├── cart/             # Componentes do carrinho
│   ├── checkout/         # Componentes de checkout
│   ├── order/            # Componentes de pedidos
│   ├── product/          # Componentes de produtos
│   └── profile/          # Componentes de perfil
├── controllers/          # Controllers (Lógica de negócio)
├── models/               # Models (Acesso a dados)
├── lib/                  # Utilitários e configurações
│   ├── db/              # Configuração Drizzle
│   └── supabase/        # Clientes Supabase
└── hooks/                # Custom React hooks
```

## Testes

O projeto inclui testes unitários com Vitest:

### Testes Unitários

**Estrutura:**

- `src/__tests__/models/` - Testes dos models
- `src/__tests__/controllers/` - Testes dos controllers

**Executando:**

```bash
# Executar todos os testes unitários
pnpm test

# Executar testes em modo watch
pnpm test --watch

# Abrir interface visual de testes
pnpm test:ui

# Gerar relatório de cobertura
pnpm test:coverage
```

**Cobertura Completa:**

- ✅ **Todos os Models** (10 models testados)
- ✅ **Todos os Controllers** (8 controllers testados)
- ✅ 89 testes unitários
- ✅ 100% de cobertura dos models e controllers

### Estrutura dos Testes

```
src/__tests__/
├── models/
│   ├── user.model.test.ts (4 testes)
│   ├── cupcake.model.test.ts (4 testes)
│   ├── category.model.test.ts (4 testes)
│   ├── cart.model.test.ts (6 testes)
│   ├── order.model.test.ts (6 testes)
│   ├── address.model.test.ts (5 testes)
│   ├── coupon.model.test.ts (6 testes)
│   ├── review.model.test.ts (4 testes)
│   ├── notification.model.test.ts (5 testes)
│   └── favorite.model.test.ts (5 testes)
└── controllers/
    ├── cart.controller.test.ts (7 testes)
    ├── order.controller.test.ts (4 testes)
    ├── payment.controller.test.ts (3 testes)
    ├── coupon.controller.test.ts (3 testes)
    ├── review.controller.test.ts (3 testes)
    ├── profile.controller.test.ts (4 testes)
    ├── product.controller.test.ts (6 testes)
    └── favorite.controller.test.ts (9 testes)
```

Todos os testes seguem o padrão AAA (Arrange-Act-Assert) e utilizam mocks para isolar unidades de código.

## Notas

- O processamento de pagamento é simulado (mock) para fins acadêmicos
- As notificações por email são simuladas (mock)
- O projeto inclui seed data para produtos e categorias
- Testes unitários estão configurados e prontos para uso
