# GitHub Actions Workflows

## Supabase Migrations

O workflow `supabase-migrations.yml` gerencia o deploy automático de migrações de banco de dados para o Supabase.

### Quando é executado?

- Quando há push para `main` com mudanças em:
  - `drizzle/**` (arquivos de migração)
  - `src/lib/db/schema/**` (definições de schema)
  - O próprio arquivo de workflow
- Manualmente via `workflow_dispatch`

### O que faz?

1. **Instala dependências** (pnpm)
2. **Configura Supabase CLI**
3. **Linka ao projeto** usando `SUPABASE_PROJECT_REF`
4. **Sincroniza migrações remotas** (`supabase db pull`) - baixa migrações do Supabase para `supabase/migrations/`
5. **Sincroniza migrações Drizzle** - copia migrações de `drizzle/` para `supabase/migrations/` se necessário
6. **Aplica migrações** (`supabase db push`) - envia migrações de `supabase/migrations/` para o Supabase remoto

### Secrets necessários

Configure no GitHub Settings → Secrets and variables → Actions:

- `SUPABASE_ACCESS_TOKEN`: Token de acesso do Supabase
- `SUPABASE_PROJECT_REF`: ID do projeto Supabase

### Como obter os secrets?

**SUPABASE_ACCESS_TOKEN:**

1. Acesse https://supabase.com/dashboard/account/tokens
2. Crie um novo token ou use um existente
3. Copie o token e adicione como secret no GitHub

**SUPABASE_PROJECT_REF:**

O `SUPABASE_PROJECT_REF` é o **Reference ID** (ID de Referência) único do seu projeto Supabase. É diferente do Project ID.

**Como encontrar:**

1. **Via Dashboard:**
   - Acesse https://supabase.com/dashboard
   - Selecione seu projeto
   - Vá em **Settings** → **General**
   - Procure por **"Reference ID"** (geralmente um código alfanumérico como `abcdefghijklmnop`)

2. **Via URL do projeto:**
   - Quando estiver no dashboard do projeto, a URL será algo como:
     `https://supabase.com/dashboard/project/abcdefghijklmnop`
   - O código após `/project/` é o seu **Reference ID**

3. Copie o Reference ID e adicione como secret no GitHub

**Exemplo:** Se sua URL é `https://supabase.com/dashboard/project/abcdefghijklmnop`, então `abcdefghijklmnop` é o seu `SUPABASE_PROJECT_REF`

---

## Supabase Database Seeding

O workflow `supabase-seed.yml` gerencia o seeding (população) do banco de dados remoto com dados iniciais.

### Quando é executado?

- **Manualmente** via `workflow_dispatch` (recomendado)
- Automaticamente quando há push para `main` com mudanças em `drizzle/seed.ts`

### O que faz?

1. **Instala dependências** (pnpm)
2. **Configura Supabase CLI**
3. **Linka ao projeto** usando `SUPABASE_PROJECT_REF`
4. **Obtém connection string** do banco remoto
5. **Executa seed script** para popular o banco com dados iniciais

### Opções de seeding

- **Sem limpar dados existentes** (padrão, seguro para produção):
  - Adiciona dados sem deletar dados existentes
  - Útil para adicionar novos produtos/categorias sem perder dados de usuários/pedidos

- **Com limpeza de dados** (use com cuidado):
  - Deleta todos os dados existentes antes de adicionar novos
  - Útil apenas para ambientes de desenvolvimento/staging

### Secrets necessários

Você precisa de apenas um secret:

- `DATABASE_URL`: Connection string completa do banco de dados remoto
  - **Como obter:**
    1. Acesse https://supabase.com/dashboard/project/_/settings/database
    2. Vá em **Connection string** → **URI**
    3. Copie a connection string completa (formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`)
    4. Adicione como secret `DATABASE_URL` no GitHub
  - **Dica:** Use a mesma `DATABASE_URL` do seu `.env.local` mas com a senha do banco remoto

### Como executar manualmente?

1. Acesse **Actions** no GitHub
2. Selecione **Seed Supabase Database**
3. Clique em **Run workflow**
4. Escolha se deseja limpar dados existentes (não recomendado para produção)
5. Clique em **Run workflow**

### Seeding local vs remoto

**Local (desenvolvimento):**
```bash
# Usa DATABASE_URL do .env.local
# Limpa dados existentes por padrão
pnpm db:seed
```

**Remoto (produção):**
- Execute via GitHub Actions workflow
- Por padrão, **não limpa** dados existentes (seguro)
- Use `CLEAR_EXISTING=true` apenas se necessário
