'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/emailService'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenciais inválidas. Tente novamente.' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            data: {
                full_name: fullName,
                avatar_url: '',
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    // Enviar email de boas-vindas (não bloqueia o signup se falhar)
    if (data?.user) {
        try {
            await sendWelcomeEmail(email, fullName);
            console.log('✅ Email de boas-vindas enviado para:', email);
        } catch (emailError) {
            console.error('⚠️ Erro ao enviar email de boas-vindas:', emailError);
            // Não bloqueia o signup se email falhar
        }
    }

    // Se o email precisa ser confirmado, não redireciona
    if (data?.user && !data.user.confirmed_at) {
        return {
            error: null,
            message: 'Conta criada com sucesso! Você já pode fazer login.'
        }
    }

    // Se não precisa confirmação, já faz login
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://clickmodelai.vercel.app';

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error(error);
        redirect('/login?error=auth_failed')
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
