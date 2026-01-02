# 🗄️ Setup do Banco de Dados - ClickModel.AI

## 📋 Resumo Rápido

Este documento explica como configurar o banco de dados Supabase para o ClickModel.AI.

---

## ✅ Passo a Passo

### 1. Deletar Tabelas Antigas (se existirem)

**⚠️ IMPORTANTE:** Execute este passo primeiro, separadamente, antes de rodar o schema completo.

**Opção 1: Usar o arquivo de limpeza (RECOMENDADO)**

1. Abra o arquivo `supabase-cleanup.sql`
2. Copie TODO o conteúdo
3. Vá no Supabase Dashboard → SQL Editor
4. Cole e clique em **Run**
5. Aguarde a conclusão (~5 segundos)

**Opção 2: Executar SQL manualmente**

Execute este SQL no **Supabase SQL Editor** para limpar tudo:

```sql
-- Remover policies antigas (tabelas antigas)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

-- Remover triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
DROP TRIGGER IF EXISTS set_updated_at_user_credits ON public.user_credits;
DROP TRIGGER IF EXISTS set_updated_at_subscription_plans ON public.subscription_plans;

-- Remover funções
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.deduct_credits(int, text) CASCADE;
DROP FUNCTION IF EXISTS public.deduct_credits(int, text, bigint) CASCADE;
DROP FUNCTION IF EXISTS public.add_credits(int, varchar, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.renew_subscription_credits() CASCADE;
DROP FUNCTION IF EXISTS public.clean_expired_sessions() CASCADE;
DROP FUNCTION IF EXISTS public.clean_expired_password_resets() CASCADE;

-- Remover tabelas antigas (em ordem de dependência)
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.generations CASCADE;
DROP TABLE IF EXISTS public.user_credits CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.password_resets CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Limpar storage policies
DROP POLICY IF EXISTS "Authenticated users can upload to generations" ON storage.objects;
DROP POLICY IF EXISTS "Public can view generations" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Deletar bucket (se quiser recriar)
DELETE FROM storage.buckets WHERE id = 'generations';
```

### 2. Criar Novo Schema

Agora execute todo o conteúdo do arquivo **`supabase-schema.sql`**:

1. Abra o arquivo `supabase-schema.sql`
2. Copie TODO o conteúdo (Ctrl+A → Ctrl+C)
3. Vá no Supabase Dashboard → SQL Editor
4. Cole o código
5. Clique em **Run**
6. Aguarde ~30-45 segundos

### 3. Verificar Criação

Execute para verificar as tabelas:

```sql
-- Ver todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver todas as funções
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

**Você deve ver:**

#### Tabelas (7):
- ✅ `credit_transactions`
- ✅ `generations`
- ✅ `password_resets`
- ✅ `sessions`
- ✅ `subscription_plans`
- ✅ `user_credits`
- ✅ `users`

#### Funções (6):
- ✅ `add_credits`
- ✅ `clean_expired_password_resets`
- ✅ `clean_expired_sessions`
- ✅ `deduct_credits`
- ✅ `handle_new_user`
- ✅ `handle_updated_at`
- ✅ `renew_subscription_credits`

### 4. Verificar Planos de Assinatura

Execute para ver os planos criados:

```sql
SELECT tier, name, price_brl, monthly_credits, is_active
FROM subscription_plans
ORDER BY price_brl;
```

**Resultado esperado:**

| tier    | name    | price_brl | monthly_credits | is_active |
|---------|---------|-----------|-----------------|-----------|
| free    | Free    | 0         | 5               | true      |
| starter | Starter | 9700      | 50              | true      |
| pro     | Pro     | 29700     | 300             | true      |
| agency  | Agency  | 49700     | 1000            | true      |

### 5. Testar Trigger de Novo Usuário

O trigger `on_auth_user_created` deve criar automaticamente:
- Registro na tabela `users`
- Registro na tabela `user_credits` (5 créditos gratuitos)
- Transação de bônus na `credit_transactions`

Para testar, crie um usuário através do sistema de autenticação e depois execute:

```sql
-- Ver usuários criados
SELECT id, email, name, created_at FROM users;

-- Ver créditos do usuário
SELECT user_id, credits, bonus_credits, subscription_tier
FROM user_credits;

-- Ver transações
SELECT user_id, amount, transaction_type, description, created_at
FROM credit_transactions
ORDER BY created_at DESC;
```

### 6. Testar Função de Dedução de Créditos

```sql
-- Simular dedução de 1 crédito
SELECT deduct_credits(1, 'Test generation');

-- Ver resultado
SELECT credits, bonus_credits FROM user_credits WHERE user_id = auth.uid();
```

---

## 🔍 Estrutura do Schema

### Diagrama de Relacionamentos

```
auth.users (Supabase Auth)
    │
    │ 1:1
    ↓
users (perfil do usuário)
    │
    ├─→ 1:1 → user_credits (saldo de créditos)
    │             │
    │             └─→ 1:N → credit_transactions (histórico)
    │
    ├─→ 1:N → sessions (tokens JWT)
    ├─→ 1:N → password_resets (recovery tokens)
    └─→ 1:N → generations (imagens geradas)

subscription_plans (configuração de planos)
```

### Principais Diferenças do Schema Antigo

| Mudança | Antes | Agora |
|---------|-------|-------|
| Tabela principal | `profiles` | `users` (mais semântico) |
| Créditos | Direto na profile | Tabela separada `user_credits` |
| Transações | `transactions` | `credit_transactions` (mais específico) |
| Autenticação | Sem suporte | Tabelas `sessions` e `password_resets` |
| Planos | Hardcoded | Tabela `subscription_plans` configurável |
| Bônus | Não existia | Campo `bonus_credits` separado |

---

## 🚨 Troubleshooting

### Erro: "relation already exists"

Execute o script de limpeza do passo 1 novamente.

### Erro: "permission denied"

Você precisa estar usando o **service_role** ou ter permissões de admin. Vá em:
1. Supabase Dashboard → SQL Editor
2. Execute lá (não via código)

### Trigger não está funcionando

Verifique se foi criado:

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
OR event_object_schema = 'auth';
```

Se não aparecer `on_auth_user_created`, execute manualmente:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Função deduct_credits não encontrada

Execute:

```sql
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'deduct_credits';
```

Se não retornar nada, execute novamente a parte de criação de funções do `supabase-schema.sql`.

---

## 📊 Queries Úteis para Debug

### Ver todos os usuários e seus créditos

```sql
SELECT
    u.email,
    u.name,
    uc.credits,
    uc.bonus_credits,
    uc.subscription_tier,
    uc.subscription_status,
    uc.subscription_renewal_date
FROM users u
LEFT JOIN user_credits uc ON uc.user_id = u.id
ORDER BY u.created_at DESC;
```

### Ver histórico de transações de um usuário

```sql
SELECT
    ct.created_at,
    ct.amount,
    ct.balance_after,
    ct.transaction_type,
    ct.description
FROM credit_transactions ct
WHERE ct.user_id = 'COLE-O-UUID-AQUI'
ORDER BY ct.created_at DESC
LIMIT 20;
```

### Ver gerações de imagens

```sql
SELECT
    u.email,
    g.clothing_type,
    g.status,
    g.credits_used,
    g.created_at
FROM generations g
JOIN users u ON u.id = g.user_id
ORDER BY g.created_at DESC
LIMIT 10;
```

### Resetar créditos de um usuário (admin)

```sql
UPDATE user_credits
SET credits = 100, bonus_credits = 50
WHERE user_id = 'COLE-O-UUID-AQUI';

-- Registrar ajuste manual
INSERT INTO credit_transactions (user_id, amount, balance_after, transaction_type, description)
VALUES ('COLE-O-UUID-AQUI', 150, 150, 'admin_adjustment', 'Manual credit reset by admin');
```

---

## ✅ Checklist Final

Antes de ir para produção:

- [ ] Todas as 7 tabelas foram criadas
- [ ] Todas as 6 funções RPC foram criadas
- [ ] Trigger `on_auth_user_created` está ativo
- [ ] 4 planos de assinatura aparecem em `subscription_plans`
- [ ] Bucket `generations` foi criado no Storage
- [ ] Políticas RLS estão ativas
- [ ] Teste de criação de usuário funcionou (5 créditos gratuitos)
- [ ] Teste de dedução de créditos funcionou

---

**Schema pronto! Agora você pode começar a implementar o frontend e backend. 🚀**
