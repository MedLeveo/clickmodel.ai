"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, CreditCard, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function SettingsPage() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [credits, setCredits] = useState({ monthly: 0, bonus: 0, tier: 'free' });
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchUserData();
    }, []);

    async function fetchUserData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);

            // Fetch credits
            const { data: creditsData } = await supabase
                .from('user_credits')
                .select('monthly_credits, bonus_credits, subscription_tier')
                .eq('user_id', user.id)
                .single();

            if (creditsData) {
                setCredits({
                    monthly: creditsData.monthly_credits || 0,
                    bonus: creditsData.bonus_credits || 0,
                    tier: creditsData.subscription_tier || 'free'
                });
            }
        }
        setLoading(false);
    }

    const totalCredits = credits.monthly + credits.bonus;
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
    const userEmail = user?.email || 'usuario@exemplo.com';

    return (
        <div className="p-8 max-w-[1200px] mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
                <p className="text-slate-500">Gerencie sua conta e assinatura.</p>
            </div>

            <div className="grid gap-6">

                {/* Perfil */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle>Perfil do Usuário</CardTitle>
                                <CardDescription>Suas informações pessoais.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <div className="p-3 bg-slate-50 rounded-md border text-slate-500">
                                    {loading ? 'Carregando...' : userEmail}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Nome</label>
                                <div className="p-3 bg-slate-50 rounded-md border text-slate-500">
                                    {loading ? 'Carregando...' : userName}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Plano e Créditos */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <CreditCard className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <CardTitle>Plano e Créditos</CardTitle>
                                <CardDescription>Gerencie seu plano atual.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg">
                                        {credits.tier === 'free' ? 'Plano Gratuito' :
                                         credits.tier === 'basic' ? 'Plano Básico' :
                                         credits.tier === 'premium' ? 'Plano Premium' : 'Plano Gratuito'}
                                    </span>
                                    <Badge variant="secondary">Atual</Badge>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {loading ? 'Carregando...' : `Você tem ${totalCredits} créditos restantes para este mês.`}
                                </p>
                            </div>
                            <Button onClick={() => router.push('/dashboard/pricing')}>
                                Fazer Upgrade
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
