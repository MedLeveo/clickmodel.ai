import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Pegar a URL correta do ambiente
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://clickmodelai.vercel.app'
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                // Ambiente local - usar origin da requisição
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                // Produção com load balancer (Vercel)
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                // Fallback - usar variável de ambiente ao invés de origin
                return NextResponse.redirect(`${siteUrl}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://clickmodelai.vercel.app'
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const errorUrl = isLocalEnv ? `${origin}/login?error=oauth_error` : `${siteUrl}/login?error=oauth_error`
    return NextResponse.redirect(errorUrl)
}
