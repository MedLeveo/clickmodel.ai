"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
    {
        name: "Starter",
        price: "R$ 97",
        description: "Perfeito para começar a testar.",
        features: [
            "50 Fotos geradas / mês",
            "Modelos Padrão",
            "Qualidade 4K",
            "Suporte por Email"
        ],
        popular: false,
    },
    {
        name: "Pro",
        price: "R$ 297",
        description: "Para lojas que precisam de escala.",
        features: [
            "300 Fotos geradas / mês",
            "Todos os Modelos Premium",
            "Prioridade na fila de geração",
            "Suporte Prioritário"
        ],
        popular: true,
    },
    {
        name: "Agency",
        price: "R$ 497",
        description: "Volume alto e API dedicada.",
        features: [
            "1000 Fotos geradas / mês",
            "API Access",
            "Gerente de Conta",
            "Treinamento de Modelo Personalizado"
        ],
        popular: false,
    }
];

export default function PricingPage() {
    return (
        <div className="p-8 max-w-[1200px] mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-slate-900">Planos Simples e Transparentes</h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">Transforme sua loja com fotos profissionais por uma fração do custo de um estúdio tradicional.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <Card key={plan.name} className={`flex flex-col relative ${plan.popular ? 'border-purple-500 shadow-xl scale-105' : ''}`}>
                        {plan.popular && (
                            <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                <Badge className="bg-purple-600 hover:bg-purple-700 px-4 py-1">Mais Popular</Badge>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-6">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-slate-500">/mês</span>
                            </div>
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <div className="bg-green-100 rounded-full p-1">
                                            <Check className="w-3 h-3 text-green-600" />
                                        </div>
                                        <span className="text-sm text-slate-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                                Escolher {plan.name}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
