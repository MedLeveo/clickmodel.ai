"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Images,
    CreditCard,
    Settings,
    LogOut,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    {
        title: "Estúdio",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Galeria",
        href: "/dashboard/gallery", // We might redirect this to dashboard anchor or separate page
        icon: Images,
        disabled: true, // Future feature or anchor
    },
    {
        title: "Planos & Preços",
        href: "/dashboard/pricing",
        icon: CreditCard,
    },
    {
        title: "Configurações",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-screen w-64 bg-white border-r border-slate-200">

            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-tr from-purple-600 to-pink-600 p-1.5 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-slate-900 tracking-tight">Modelize.AI</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.disabled ? "#" : item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                                isActive
                                    ? "bg-purple-50 text-purple-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-purple-600" : "text-slate-400")} />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-slate-900 truncate">Usuário</p>
                        <p className="text-xs text-slate-500 truncate">usuario@exemplo.com</p>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                </Button>
            </div>
        </div>
    );
}
