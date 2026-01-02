# 🚀 ClickModel.AI - Guia de Configuração

Este guia irá te ajudar a configurar todas as credenciais necessárias para rodar o ClickModel.AI.

---

## 📋 Índice

1. [Supabase - Banco de Dados](#1-supabase---banco-de-dados)
2. [Google OAuth - Login Social](#2-google-oauth---login-social)
3. [SendGrid - Serviço de Email](#3-sendgrid---serviço-de-email)
4. [Fal.ai - Geração de Imagens](#4-falai---geração-de-imagens)
5. [Deploy na Vercel](#5-deploy-na-vercel)

---

## 1. Supabase - Banco de Dados

### 1.1. Criar o Schema

1. Acesse seu projeto Supabase: https://supabase.com/dashboard/project/ehbdcxwtxeyqpbxqvjfb
2. Vá em **SQL Editor** (ícone de banco de dados no menu lateral)
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `supabase-schema.sql`
5. Cole no editor e clique em **Run**
6. Aguarde a execução (pode demorar ~30 segundos)

### 1.2. Verificar Criação das Tabelas

Execute este SQL para verificar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver estas tabelas:
- ✅ `users`
- ✅ `sessions`
- ✅ `password_resets`
- ✅ `user_credits`
- ✅ `subscription_plans`
- ✅ `credit_transactions`
- ✅ `generations`

### 1.3. Configurar Google OAuth no Supabase

1. No Supabase, vá em **Authentication** → **Providers**
2. Ative o provider **Google**
3. **NÃO** preencha as credenciais ainda (vamos fazer isso depois de criar no Google Cloud)
4. Copie a **Redirect URL** fornecida pelo Supabase (algo como: `https://ehbdcxwtxeyqpbxqvjfb.supabase.co/auth/v1/callback`)

---

## 2. Google OAuth - Login Social

### 2.1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Clique em **Select a project** → **New Project**
3. Nome do projeto: `ClickModel AI`
4. Clique em **Create**

### 2.2. Configurar OAuth Consent Screen

1. No menu lateral, vá em **APIs & Services** → **OAuth consent screen**
2. Escolha **External** e clique em **Create**
3. Preencha:
   - **App name:** ClickModel.AI
   - **User support email:** seu email
   - **Developer contact email:** seu email
4. Clique em **Save and Continue**
5. Em **Scopes**, clique em **Add or Remove Scopes**
6. Adicione estes scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
7. Clique em **Update** → **Save and Continue**
8. Em **Test users**, adicione seu email Gmail para testes
9. Clique em **Save and Continue** → **Back to Dashboard**

### 2.3. Criar Credenciais OAuth

1. Vá em **APIs & Services** → **Credentials**
2. Clique em **+ Create Credentials** → **OAuth client ID**
3. Tipo de aplicativo: **Web application**
4. Nome: `ClickModel.AI Web Client`
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-app.vercel.app
   https://ehbdcxwtxeyqpbxqvjfb.supabase.co
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://your-app.vercel.app/auth/callback
   https://ehbdcxwtxeyqpbxqvjfb.supabase.co/auth/v1/callback
   ```
   ⚠️ Use a URL exata que você copiou do Supabase no passo 1.3
7. Clique em **Create**

### 2.4. Copiar Credenciais

Você verá um modal com:
- **Client ID** - algo como: `123456-abc.apps.googleusercontent.com`
- **Client Secret** - algo como: `GOCSPX-abc123...`

**Cole estas credenciais em 3 lugares:**

#### A. No arquivo `.env` do projeto:
```env
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

#### B. No Supabase:
1. Volte para **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Cole o **Client ID** e **Client Secret**
3. Clique em **Save**

#### C. No Vercel (quando fizer deploy):
- Adicione as variáveis de ambiente no dashboard da Vercel

---

## 3. SendGrid - Serviço de Email

### 3.1. Criar Conta no SendGrid

1. Acesse: https://app.sendgrid.com/
2. Clique em **Sign Up** (ou faça login se já tiver conta)
3. Preencha o cadastro
4. Verifique seu email

### 3.2. Criar API Key

1. No dashboard, vá em **Settings** → **API Keys**
2. Clique em **Create API Key**
3. Nome: `ClickModel.AI Production`
4. Permissões: **Full Access** (ou **Restricted Access** com permissões de Mail Send)
5. Clique em **Create & View**
6. **⚠️ COPIE A CHAVE AGORA** (ela não será exibida novamente!)
   - Formato: `SG.xxxx-xxxx.xxxxxxxxxxxxxxxx`

### 3.3. Configurar Sender Identity

1. Vá em **Settings** → **Sender Authentication**
2. Clique em **Verify a Single Sender**
3. Preencha:
   - **From Name:** ClickModel.AI
   - **From Email:** noreply@clickmodel.ai (ou seu domínio)
   - **Reply To:** suporte@clickmodel.ai
   - **Address, City, State, etc.** (pode ser endereço pessoal)
4. Clique em **Create**
5. Verifique o email que o SendGrid enviou
6. Clique no link de verificação

### 3.4. Criar Email Templates (Opcional - Recomendado)

#### Template 1: Welcome Email
1. Vá em **Email API** → **Dynamic Templates**
2. Clique em **Create a Dynamic Template**
3. Nome: `Welcome - ClickModel.AI`
4. Clique em **Add Version** → **Blank Template** → **Code Editor**
5. Cole este HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bem-vindo ao ClickModel.AI!</h1>
    </div>
    <div class="content">
      <p>Olá <strong>{{name}}</strong>,</p>
      <p>Estamos muito felizes em tê-lo conosco! 🚀</p>
      <p>Você ganhou <strong>5 créditos gratuitos</strong> para começar a criar fotos profissionais com IA.</p>
      <a href="{{app_url}}/dashboard" class="button">Começar Agora</a>
      <p style="margin-top: 30px;">Se tiver dúvidas, estamos aqui para ajudar!</p>
    </div>
    <div class="footer">
      <p>© 2025 ClickModel.AI - Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>
```

6. Clique em **Save** → copie o **Template ID** (formato: `d-xxxxxxxxxxxxx`)

#### Template 2: Password Reset
1. Repita o processo para criar template de reset de senha
2. Cole este HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Redefinir Senha</h1>
    </div>
    <div class="content">
      <p>Olá,</p>
      <p>Recebemos uma solicitação para redefinir sua senha no ClickModel.AI.</p>
      <a href="{{reset_url}}" class="button">Redefinir Minha Senha</a>
      <div class="alert">
        <strong>⚠️ Este link expira em 1 hora.</strong>
      </div>
      <p>Se você não solicitou esta alteração, ignore este email.</p>
    </div>
    <div class="footer">
      <p>© 2025 ClickModel.AI - Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>
```

### 3.5. Atualizar `.env`

```env
SENDGRID_API_KEY=SG.sua-api-key-aqui
SENDGRID_FROM_EMAIL=noreply@clickmodel.ai
SENDGRID_FROM_NAME=ClickModel.AI
SENDGRID_TEMPLATE_WELCOME=d-seu-template-id
SENDGRID_TEMPLATE_PASSWORD_RESET=d-seu-template-id
```

---

## 4. Fal.ai - Geração de Imagens

### 4.1. Criar Conta

1. Acesse: https://fal.ai/
2. Clique em **Sign Up**
3. Faça login com Google ou GitHub

### 4.2. Obter API Key

1. No dashboard, vá em **API Keys** (ou acesse: https://fal.ai/dashboard/keys)
2. Clique em **Create New Key**
3. Nome: `ClickModel.AI Production`
4. Copie a chave (formato: `fal_xxxxxxxxxxxxx`)

### 4.3. Adicionar Créditos (se necessário)

1. Vá em **Billing** → **Add Credits**
2. O Fal.ai oferece alguns créditos gratuitos para teste
3. Para produção, você precisará adicionar um método de pagamento

### 4.4. Atualizar `.env`

```env
FAL_KEY=fal_sua-chave-aqui
NEXT_PUBLIC_FAL_KEY=fal_sua-chave-aqui
```

---

## 5. Deploy na Vercel

### 5.1. Preparar o Repositório GitHub

1. Crie um repositório no GitHub
2. Adicione o projeto:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ClickModel.AI"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/clickmodel-ai.git
   git push -u origin main
   ```

### 5.2. Deploy na Vercel

1. Acesse: https://vercel.com/
2. Clique em **Add New** → **Project**
3. Importe seu repositório GitHub
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (padrão)
   - **Output Directory:** `.next` (padrão)

### 5.3. Adicionar Variáveis de Ambiente

Na seção **Environment Variables**, adicione TODAS as variáveis do seu `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FAL_KEY=...
NEXT_PUBLIC_FAL_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
GOOGLE_CALLBACK_URL=https://seu-app.vercel.app/auth/callback
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
SENDGRID_FROM_NAME=...
SENDGRID_TEMPLATE_WELCOME=...
SENDGRID_TEMPLATE_PASSWORD_RESET=...
JWT_SECRET=... (gere novo com: openssl rand -base64 32)
SESSION_SECRET=... (gere novo com: openssl rand -base64 32)
JWT_EXPIRATION=604800
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
NODE_ENV=production
```

### 5.4. Atualizar URLs do Google OAuth

Depois do deploy, você receberá uma URL (ex: `https://clickmodel-ai.vercel.app`)

1. Volte no **Google Cloud Console** → **Credentials**
2. Edite o OAuth Client ID
3. Adicione a URL de produção nos **Authorized redirect URIs**:
   ```
   https://seu-app.vercel.app/auth/callback
   ```
4. Salve

### 5.5. Atualizar Variável no Vercel

1. No dashboard da Vercel, vá em **Settings** → **Environment Variables**
2. Edite `GOOGLE_CALLBACK_URL`:
   ```
   GOOGLE_CALLBACK_URL=https://seu-app.vercel.app/auth/callback
   ```
3. Faça um novo deploy (ou aguarde o redeploy automático)

---

## ✅ Checklist Final

Antes de ir para produção, verifique:

- [ ] Tabelas criadas no Supabase
- [ ] Google OAuth configurado e testado
- [ ] SendGrid configurado e email de boas-vindas funcionando
- [ ] Fal.ai API key válida
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Deploy na Vercel funcionando
- [ ] Login com Google funcionando em produção
- [ ] Geração de imagens funcionando
- [ ] Sistema de créditos funcionando

---

## 🆘 Troubleshooting

### Erro: "Invalid OAuth callback URL"
- Verifique se a URL de callback no Google Cloud Console está EXATAMENTE igual à configurada no `.env`

### Erro: "Unauthorized" ao enviar email
- Verifique se o Sender Identity foi verificado no SendGrid
- Confirme que a API key tem permissão de "Mail Send"

### Erro: "Insufficient credits" mesmo com créditos
- Execute no Supabase SQL Editor:
  ```sql
  SELECT * FROM user_credits WHERE user_id = 'seu-user-id';
  ```
- Verifique se a função `deduct_credits()` foi criada corretamente

### Erro de CORS no Fal.ai
- Verifique se `NEXT_PUBLIC_FAL_KEY` está configurado
- Confirme que a chave é válida e tem créditos

---

## 📞 Suporte

Se tiver problemas, abra uma issue no GitHub ou entre em contato.

**Boa sorte com o ClickModel.AI! 🚀**
