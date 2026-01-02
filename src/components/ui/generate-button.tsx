"use client";
import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
    onClick: () => void;
    isLoading: boolean;
    disabled: boolean;
    credits: number;
}

export function GenerateButton({ onClick, isLoading, disabled, credits }: GenerateButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={cn(
                "relative group w-full overflow-hidden rounded-xl p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {/* Animated Gradient Border */}
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />

            {/* Button Content */}
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-8 py-4 text-sm font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900">

                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-purple-400" />
                        <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent font-bold">
                            Creating Magic...
                        </span>
                    </>
                ) : (
                    <>
                        <Wand2 className="mr-2 h-5 w-5 text-purple-400" />
                        <span className="font-semibold text-lg mr-2">
                            Generate
                        </span>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 border border-slate-700">
                            -{1} credit
                        </span>
                    </>
                )}
            </span>
        </button>
    );
}
