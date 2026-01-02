"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, CreditCard, Shield } from "lucide-react";

export default function SettingsPage() {
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
                                    usuario@exemplo.com
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Nome</label>
                                <div className="p-3 bg-slate-50 rounded-md border text-slate-500">
                                    Usuário Modelo
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
                                    <span className="font-semibold text-lg">Plano Gratuito</span>
                                    <Badge variant="secondary">Atual</Badge>
                                </div>
                                <p className="text-sm text-slate-500">Você tem 5 créditos restantes para este mês.</p>
                            </div>
                            <Button>Fazer Upgrade</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
