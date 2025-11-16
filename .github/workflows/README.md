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

1. Acesse https://supabase.com/dashboard/project/_/settings/general
2. Encontre o "Reference ID" do projeto
3. Copie o ID e adicione como secret no GitHub
