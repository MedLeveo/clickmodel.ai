"use client";

import { useTransition, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Eye, EyeOff, Globe, Sun } from "lucide-react"; // Icons
import { login, signup, signInWithGoogle } from "./actions"; // Backend Actions

function LoginForm() {
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isLogin, setIsLogin] = useState(true);

    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UX States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(searchParams.get("error") === "unauthorized" ? "Você precisa fazer login primeiro." : null);

    // Helper to validate email (CinthiaMed Logic)
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Email inválido';

        const domain = email.split('@')[1]?.toLowerCase();
        if (domain === 'gmail.com') return null;

        const publicProviders = [
            'yahoo.com', 'yahoo.com.br', 'hotmail.com', 'outlook.com',
            'live.com', 'bol.com.br', 'uol.com.br', 'terra.com.br',
            'ig.com.br', 'globo.com', 'r7.com', 'aol.com', 'icloud.com'
        ];

        if (publicProviders.includes(domain)) {
            return 'Por favor, use um email do Gmail ou email corporativo';
        }
        return null;
    };

    // Helper to validate password strength (CinthiaMed Logic)
    const validatePassword = (pwd: string) => {
        const errors = [];
        if (pwd.length < 6) errors.push('Mínimo de 6 caracteres');
        if (!/[A-Z]/.test(pwd)) errors.push('Pelo menos uma letra maiúscula');
        if (!/[0-9]/.test(pwd)) errors.push('Pelo menos um número');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('Pelo menos um caractere especial (!@#$...)');
        return errors;
    };

    // Derived state for password errors (only show on register)
    const passwordErrors = !isLogin ? validatePassword(password) : [];

    const handleSubmit = (formData: FormData) => {
        setError(null);

        // Client-side Validation
        const emailVal = formData.get("email") as string;
        const passwordVal = formData.get("password") as string;

        const emailError = validateEmail(emailVal);
        if (emailError) {
            setError(emailError);
            return;
        }

        if (!isLogin) {
            const confirmVal = formData.get("confirmPassword") as string;
            // Password Strength
            const pwdErrors = validatePassword(passwordVal);
            if (pwdErrors.length > 0) {
                setError("A senha não atende aos requisitos de segurança");
                return;
            }
            // Match
            if (passwordVal !== confirmVal) {
                setError("As senhas não coincidem");
                return;
            }
        }

        startTransition(async () => {
            let result;
            if (isLogin) {
                result = await login(formData);
            } else {
                result = await signup(formData);
            }

            if (result?.error) {
                setError(result.error);
            }
        });
    };

    // Render Logic
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
            fontFamily: "var(--font-outfit), sans-serif", // Using Outfit font
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background decoration */}
            <div className="absolute -top-[50%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[60px] opacity-70"
                style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-[30%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[60px] opacity-70"
                style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)' }} />

            {/* Login Container */}
            <div className="w-full max-w-[460px] p-5 relative z-10">
                {/* Logo */}
                <div className="text-center mb-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-[#9F55FF] to-[#FF55B8] rounded-[24px] flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
                        <Sparkles className="w-8 h-8 text-white" fill="white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-br from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-widest">
                        ClickModel
                    </h1>
                </div>

                {/* Login Card */}
                <div style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                }}>
                    {/* Google Login Button */}
                    <form action={signInWithGoogle}>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: '#1a1f2e',
                                border: '1px solid #2a3142',
                                borderRadius: '12px',
                                color: '#e2e8f0',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                fontFamily: "inherit",
                                marginBottom: '24px',
                            }}
                            className="hover:bg-[#2a3142] hover:border-purple-500 transition-colors group"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar com Google
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-[#2a3142]" />
                        <span className="px-4 text-slate-500 text-sm font-medium">OU</span>
                        <div className="flex-1 h-px bg-[#2a3142]" />
                    </div>

                    {/* Form */}
                    <form action={handleSubmit} className="space-y-5">
                        {/* Name Field (Register Only) */}
                        {!isLogin && (
                            <input
                                name="fullName"
                                type="text"
                                placeholder="Digite seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: '#1a1f2e',
                                    border: '1px solid #2a3142',
                                    borderRadius: '12px',
                                    color: '#e2e8f0',
                                    fontSize: '15px',
                                    fontFamily: "inherit",
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s',
                                }}
                                className="focus:border-purple-500 placeholder:text-slate-600"
                            />
                        )}

                        <input
                            name="email"
                            type="email"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: '#1a1f2e',
                                border: '1px solid #2a3142',
                                borderRadius: '12px',
                                color: '#e2e8f0',
                                fontSize: '15px',
                                fontFamily: "inherit",
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s',
                            }}
                            className="focus:border-purple-500 placeholder:text-slate-600"
                        />

                        {/* Password Field */}
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    paddingRight: '50px',
                                    backgroundColor: '#1a1f2e',
                                    border: '1px solid #2a3142',
                                    borderRadius: '12px',
                                    color: '#e2e8f0',
                                    fontSize: '15px',
                                    fontFamily: "inherit",
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s',
                                }}
                                className="focus:border-purple-500 placeholder:text-slate-600"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 p-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password (Register Only) */}
                        {!isLogin && (
                            <div className="relative">
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirme sua senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required={!isLogin}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        paddingRight: '50px',
                                        backgroundColor: '#1a1f2e',
                                        border: '1px solid #2a3142',
                                        borderRadius: '12px',
                                        color: '#e2e8f0',
                                        fontSize: '15px',
                                        fontFamily: "inherit",
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s',
                                    }}
                                    className="focus:border-purple-500 placeholder:text-slate-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 p-1"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        )}

                        {/* Password Requirements (Register Only) */}
                        {!isLogin && passwordErrors.length > 0 && (
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <div className="text-yellow-500 text-xs font-semibold mb-2">A senha deve conter:</div>
                                {passwordErrors.map((err, idx) => (
                                    <div key={idx} className="text-yellow-500/80 text-[10px] sm:text-xs">
                                        • {err}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Auth Mode Toggle */}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">
                                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError(null);
                                    }}
                                    className="text-purple-500 font-semibold ml-1.5 hover:underline"
                                >
                                    {isLogin ? 'Cadastre-se' : 'Faça login'}
                                </button>
                            </span>

                            {isLogin && (
                                <button type="button" className="text-purple-500 font-semibold text-sm hover:underline">
                                    Esqueci minha senha
                                </button>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: isPending ? '#64748b' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: isPending ? 'not-allowed' : 'pointer',
                                fontFamily: "inherit",
                                transition: 'all 0.2s',
                                boxShadow: isPending ? 'none' : '0 4px 20px rgba(139, 92, 246, 0.4)',
                            }}
                            className="hover:-translate-y-0.5"
                        >
                            {isPending ? 'Processando...' : (isLogin ? 'Continuar com e-mail' : 'Criar conta')}
                        </button>

                        {/* Terms */}
                        <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
                            Ao criar sua conta, você concorda com nossos{' '}
                            <Link href="#" className="text-purple-500 hover:underline">Termos de Uso</Link>
                            {' '}e confirma que leu nossa{' '}
                            <Link href="#" className="text-purple-500 hover:underline">Política de Privacidade</Link>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
            }}>
                <div className="text-white text-lg">Carregando...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
