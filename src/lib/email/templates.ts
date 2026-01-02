/**
 * Templates de Email - ClickModel.AI
 *
 * Aqui você pode personalizar todos os textos e conteúdos dos emails enviados.
 */

export const emailTemplates = {
  /**
   * Configurações globais de email
   */
  config: {
    fromName: 'ClickModel.AI',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'clickmodelai@gmail.com',
    supportEmail: 'suporte@clickmodel.ai'
  },

  /**
   * Template: Email de Verificação (enviado no cadastro)
   */
  emailVerification: {
    subject: 'Confirme seu email - ClickModel.AI',
    title: 'Confirme seu email',
    logoEmoji: '✨',

    greeting: (name: string) => `Olá <span class="highlight">${name}</span>,`,

    intro: 'Obrigado por se cadastrar no ClickModel.AI! Para começar a usar a plataforma, você precisa confirmar seu endereço de email.',

    instructions: 'Clique no botão abaixo para verificar sua conta:',

    buttonText: 'Verificar meu email',

    expirationWarning: {
      title: '⏰ Este link expira em 24 horas',
      description: 'Por segurança, este link de verificação é válido por 24 horas.'
    },

    securityNote: 'Se você não criou uma conta no ClickModel.AI, pode ignorar este email com segurança.',

    footer: {
      line1: 'Este é um email automático do ClickModel.AI',
      line2: 'Dúvidas? Entre em contato: clickmodelai@gmail.com'
    }
  },

  /**
   * Template: Email de Boas-Vindas (enviado após verificação)
   */
  welcome: {
    subject: 'Bem-vindo ao ClickModel.AI! 🎉',
    title: 'Bem-vindo ao ClickModel.AI!',
    logoEmoji: '✨',

    greeting: (name: string) => `Olá <span class="highlight">${name}</span>,`,

    intro: 'Sua conta foi verificada com sucesso! Agora você tem acesso completo à plataforma de virtual try-on com IA.',

    closing: 'Clique no botão abaixo para começar a criar suas imagens:',

    buttonText: 'Acessar ClickModel.AI',

    footer: {
      line1: 'Este é um email automático do ClickModel.AI',
      line2: 'Dúvidas? Entre em contato: clickmodelai@gmail.com'
    }
  },

  /**
   * Template: Email de Recuperação de Senha
   */
  passwordReset: {
    subject: 'Recuperação de Senha - ClickModel.AI',
    title: 'Recuperação de Senha',
    logoEmoji: '🔐',

    intro: 'Você solicitou a recuperação da sua senha no ClickModel.AI.',
    instructions: 'Clique no botão abaixo para criar uma nova senha:',

    buttonText: 'Redefinir Senha',

    expirationWarning: {
      title: '⏰ Este link expira em 1 hora',
      description: 'Por motivos de segurança, este link de recuperação é válido por apenas 1 hora.'
    },

    securityNote: 'Se você não solicitou a recuperação de senha, pode ignorar este email com segurança.',

    footer: {
      line1: 'Este é um email automático do ClickModel.AI',
      line2: 'Dúvidas? Entre em contato: clickmodelai@gmail.com'
    }
  }
};
