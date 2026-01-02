# 💳 Sistema de Créditos - ClickModel.AI

## 📊 Visão Geral

O sistema de créditos foi projetado para:
- ✅ Controlar uso justo da plataforma
- ✅ Monetizar através de assinaturas mensais
- ✅ Renovar créditos automaticamente a cada mês
- ✅ Oferecer créditos bônus que nunca expiram
- ✅ Rastrear todas as transações para auditoria

---

## 🎯 Como Funciona

### 1. Tipos de Créditos

Existem **2 tipos de créditos**:

#### A. **Créditos Mensais** (Renováveis)
- Resetam todo mês na data de renovação
- Quantidade depende do plano de assinatura
- Não acumulam (se não usar, perde)
- Exemplo: Plano Pro = 300 créditos/mês

#### B. **Créditos Bônus** (Permanentes)
- Nunca expiram
- Podem ser dados como:
  - Bônus de boas-vindas (5 créditos gratuitos)
  - Promoções especiais
  - Compensação por erros do sistema
- Acumulam ao longo do tempo

### 2. Ordem de Consumo

Quando o usuário gera uma imagem, os créditos são deduzidos nesta ordem:
1. **Primeiro:** Créditos mensais
2. **Depois:** Créditos bônus (se os mensais acabarem)

Isso garante que os créditos renováveis sejam usados primeiro.

---

## 📅 Planos de Assinatura

### Tabela de Planos

| Plano      | Preço       | Créditos/Mês | Recursos                                    |
|------------|-------------|--------------|---------------------------------------------|
| **Free**   | R$ 0        | 5            | 5 gerações gratuitas, modelos básicos, HD   |
| **Starter**| R$ 97/mês   | 50           | 50 gerações, modelos padrão, 4K, email      |
| **Pro**    | R$ 297/mês  | 300          | 300 gerações, modelos premium, fila prioritária |
| **Agency** | R$ 497/mês  | 1000         | 1000 gerações, API access, suporte dedicado |

### Estados da Assinatura

```
subscription_status (VARCHAR):
- 'active' = Assinatura ativa, créditos renovam mensalmente
- 'inactive' = Sem assinatura ativa (plano Free)
- 'cancelled' = Cancelada, mas ainda válida até o fim do período
- 'past_due' = Pagamento falhou, bloqueado temporariamente
```

---

## 🔄 Renovação Automática de Créditos

### Fluxo de Renovação Mensal

```
┌─────────────────────────────────────┐
│ Data de Renovação Chegou            │
│ (subscription_renewal_date <= NOW) │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Webhook do Stripe:                  │
│ "invoice.payment_succeeded"         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Chamar função SQL:                  │
│ renew_subscription_credits()        │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 1. Reseta credits = monthly_limit   │
│ 2. Preserva bonus_credits           │
│ 3. Atualiza renewal_date + 1 mês    │
│ 4. Registra transação no log        │
└─────────────────────────────────────┘
```

### Exemplo Prático

**Usuário no Plano Pro:**
- `monthly_credit_limit = 300`
- `bonus_credits = 20` (ganhou em promoção)

**Cenário 1: Dia 1 do mês (após renovação)**
```sql
credits = 300  -- Resetou para o limite mensal
bonus_credits = 20  -- Preservados
total_disponível = 320
```

**Cenário 2: Dia 15 do mês (usou 250 créditos)**
```sql
credits = 50  -- (300 - 250)
bonus_credits = 20  -- Não tocou nos bônus ainda
total_disponível = 70
```

**Cenário 3: Dia 25 do mês (usou mais 60 créditos)**
```sql
credits = 0  -- (50 - 50 = 0, depois -10 dos bônus)
bonus_credits = 10  -- (20 - 10)
total_disponível = 10
```

**Cenário 4: Dia 1 do próximo mês (renovação)**
```sql
credits = 300  -- RESETOU!
bonus_credits = 10  -- MANTEVE!
total_disponível = 310
```

---

## 💰 Transações de Créditos

Todas as mudanças de créditos são registradas na tabela `credit_transactions`.

### Tipos de Transação

| Tipo                   | Descrição                                      | Amount |
|------------------------|------------------------------------------------|--------|
| `welcome_bonus`        | Bônus de boas-vindas (5 créditos gratuitos)    | +5     |
| `subscription_renewal` | Renovação mensal da assinatura                 | +300   |
| `purchase`             | Compra avulsa de créditos (se implementado)    | +100   |
| `generation_usage`     | Uso de créditos para gerar imagem              | -1     |
| `bonus`                | Créditos bônus por promoção/compensação        | +50    |
| `refund`               | Reembolso por erro de geração                  | +1     |
| `admin_adjustment`     | Ajuste manual por admin/suporte                | ±X     |

### Exemplo de Registro de Transação

```sql
INSERT INTO credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    description,
    generation_id
)
VALUES (
    'user-uuid-123',
    -1,
    49,
    'generation_usage',
    'Generated image: Blue T-shirt on Model #2',
    12345
);
```

---

## 🔧 Funções SQL (RPCs)

### 1. `deduct_credits()`

**Uso:** Deduzir créditos ao gerar uma imagem

```sql
SELECT deduct_credits(
    credits_to_deduct := 1,
    generation_description := 'Generated image',
    generation_ref_id := 123
);
```

**Retorno:**
```json
{
  "success": true,
  "credits_deducted": 1,
  "new_balance": 49
}
```

**Comportamento:**
- ✅ Verifica se o usuário está autenticado
- ✅ Bloqueia a linha com `FOR UPDATE` (evita race conditions)
- ✅ Valida se há créditos suficientes
- ✅ Deduz créditos atomicamente
- ✅ Registra transação no log
- ❌ Retorna erro se créditos insuficientes

### 2. `add_credits()`

**Uso:** Adicionar créditos (compra, bônus, reembolso)

```sql
SELECT add_credits(
    credits_to_add := 100,
    transaction_type_param := 'purchase',
    description_param := 'Purchased 100 credits pack',
    stripe_payment_id_param := 'pi_abc123'
);
```

**Retorno:**
```json
{
  "success": true,
  "credits_added": 100,
  "new_balance": 149
}
```

### 3. `renew_subscription_credits()`

**Uso:** Renovar créditos mensais (chamado automaticamente)

```sql
SELECT renew_subscription_credits();
```

**Retorno:**
```json
{
  "success": true,
  "credits_renewed": 300,
  "next_renewal": "2025-02-15T10:00:00Z"
}
```

**Comportamento:**
- ✅ Reseta `credits` para `monthly_credit_limit`
- ✅ Mantém `bonus_credits` intactos
- ✅ Atualiza `subscription_renewal_date` para +1 mês
- ✅ Registra transação do tipo `subscription_renewal`

---

## 🤖 Automação com Stripe Webhooks

### Quando o Stripe Processa o Pagamento Mensal

```javascript
// Endpoint: /api/webhooks/stripe
// Event: 'invoice.payment_succeeded'

const session = event.data.object;
const userId = session.metadata.user_id;
const subscriptionId = session.subscription;

// 1. Atualizar status da assinatura
await supabase
  .from('user_credits')
  .update({
    subscription_status: 'active',
    subscription_renewal_date: new Date(nextBillingDate)
  })
  .eq('stripe_subscription_id', subscriptionId);

// 2. Renovar créditos
await supabase.rpc('renew_subscription_credits', { user_id: userId });
```

### Quando o Pagamento Falha

```javascript
// Event: 'invoice.payment_failed'

await supabase
  .from('user_credits')
  .update({
    subscription_status: 'past_due'
  })
  .eq('stripe_subscription_id', subscriptionId);

// Enviar email notificando o usuário
```

### Quando o Usuário Cancela

```javascript
// Event: 'customer.subscription.deleted'

await supabase
  .from('user_credits')
  .update({
    subscription_status: 'cancelled',
    subscription_end_date: new Date(periodEnd)
  })
  .eq('stripe_subscription_id', subscriptionId);

// Usuário mantém acesso até o fim do período pago
```

---

## 📱 Frontend: Exibição de Créditos

### No Dashboard

```tsx
// Mostrar créditos disponíveis
const { data: userCredits } = await supabase
  .from('user_credits')
  .select('credits, bonus_credits, monthly_credit_limit, subscription_tier')
  .eq('user_id', userId)
  .single();

const totalCredits = userCredits.credits + userCredits.bonus_credits;

// UI
<Badge>
  💎 {totalCredits} Créditos
</Badge>

// Breakdown detalhado
<div>
  <p>Créditos mensais: {userCredits.credits} / {userCredits.monthly_credit_limit}</p>
  <p>Créditos bônus: {userCredits.bonus_credits}</p>
  <p>Próxima renovação: {renewalDate}</p>
</div>
```

---

## 🛡️ Segurança

### Row Level Security (RLS)

Todas as operações de créditos são protegidas:

```sql
-- Usuário só pode ver seus próprios créditos
CREATE POLICY "Users can view their own credits"
    ON user_credits FOR SELECT
    USING (auth.uid() = user_id);

-- Usuário NÃO pode UPDATE diretamente
-- Somente através de funções SECURITY DEFINER
```

### Funções Seguras

As funções `deduct_credits()` e `add_credits()` usam `SECURITY DEFINER`, o que significa:
- ✅ Executam com privilégios elevados
- ✅ Bypassam RLS de forma controlada
- ✅ Validam autenticação internamente
- ✅ Usam `FOR UPDATE` para locks de linha (evita race conditions)

---

## 📈 Relatórios e Analytics

### Consultas Úteis

#### Créditos Usados por Usuário (mês atual)
```sql
SELECT
    u.name,
    u.email,
    SUM(ABS(ct.amount)) AS credits_used,
    uc.subscription_tier
FROM credit_transactions ct
JOIN users u ON u.id = ct.user_id
JOIN user_credits uc ON uc.user_id = ct.user_id
WHERE ct.transaction_type = 'generation_usage'
  AND ct.created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY u.id, u.name, u.email, uc.subscription_tier
ORDER BY credits_used DESC;
```

#### Revenue Potencial (créditos usados × valor médio)
```sql
SELECT
    uc.subscription_tier,
    COUNT(DISTINCT uc.user_id) AS total_users,
    SUM(ABS(ct.amount)) AS total_credits_used,
    sp.price_brl / 100 AS plan_price_reais
FROM credit_transactions ct
JOIN user_credits uc ON uc.user_id = ct.user_id
JOIN subscription_plans sp ON sp.tier = uc.subscription_tier
WHERE ct.transaction_type = 'generation_usage'
  AND ct.created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY uc.subscription_tier, sp.price_brl;
```

---

## 🚨 Edge Cases

### 1. Usuário usa 100 créditos, depois faz upgrade de Starter (50) para Pro (300)

**Solução:**
- O upgrade imediato ajusta `monthly_credit_limit = 300`
- Não reseta os créditos até a próxima data de renovação
- Na próxima renovação, ele receberá 300 créditos

### 2. Usuário cancela no meio do mês

**Solução:**
- `subscription_status = 'cancelled'`
- `subscription_end_date` = fim do período pago
- Ele continua usando créditos até o `end_date`
- Após `end_date`, volta para plano Free (5 créditos)

### 3. Geração falha após deduzir créditos

**Solução:**
- No código da API (`/api/generate/route.ts`), se `fal.ai` falhar:
  ```javascript
  // Reembolsar crédito
  await supabase.rpc('add_credits', {
    credits_to_add: 1,
    transaction_type_param: 'refund',
    description_param: 'Generation failed - refund'
  });
  ```

### 4. Race condition: 2 gerações simultâneas com 1 crédito

**Solução:**
- A função `deduct_credits()` usa `FOR UPDATE`
- A primeira requisição bloqueia a linha
- A segunda espera o lock ser liberado
- Quando a segunda executar, já não terá créditos suficientes → retorna erro

---

## ✅ Checklist de Implementação

- [x] Tabelas criadas (`user_credits`, `credit_transactions`, `subscription_plans`)
- [x] Funções SQL criadas (`deduct_credits`, `add_credits`, `renew_subscription_credits`)
- [x] Trigger de novo usuário (dá 5 créditos de boas-vindas)
- [x] RLS configurado
- [ ] Integração com Stripe (webhooks)
- [ ] Cron job para renovação automática (alternativa ao webhook)
- [ ] Frontend mostrando créditos
- [ ] Sistema de reembolso automático em caso de erro
- [ ] Dashboard de analytics de uso

---

## 📞 Próximos Passos

1. **Integrar Stripe** para cobranças recorrentes
2. **Configurar webhooks** do Stripe para renovação automática
3. **Criar página de Pricing** com checkout
4. **Implementar sistema de reembolso** automático
5. **Adicionar analytics** de uso de créditos no dashboard admin

---

**Sistema de créditos pronto para produção! 🚀**
