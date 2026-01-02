"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // or a loading spinner
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed inset-y-0 z-50 w-64">
                <AppSidebar />
            </aside>

            <main className="lg:pl-64 w-full min-h-screen flex flex-col">
                {/* Mobile Header */}
                <div className="lg:hidden h-16 border-b bg-white/80 backdrop-blur-md flex items-center px-4 sticky top-0 z-40 justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-tr from-purple-600 to-pink-600 p-1 rounded-md">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">ClickModel.AI</span>
                    </div>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6 text-slate-700" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72">
                            <AppSidebar />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
