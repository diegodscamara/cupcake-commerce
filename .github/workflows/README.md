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
