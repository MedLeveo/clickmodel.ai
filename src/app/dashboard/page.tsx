"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Upload, Camera, ImageIcon, LayoutGrid, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { GenerateButton } from "@/components/ui/generate-button";
import { ComparisonGallery } from "@/components/dashboard/comparison-gallery";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Placeholder models
const MODELS = [
    { id: "model-1", name: "Mulher Negra", url: "https://placehold.co/400x600?text=Mulher+Negra" },
    { id: "model-2", name: "Mulher Branca", url: "https://placehold.co/400x600?text=Mulher+Branca" },
    { id: "model-3", name: "Homem Asiático", url: "https://placehold.co/400x600?text=Homem+Asiatico" },
];

export default function Dashboard() {
    const supabase = createClient();
    const router = useRouter();

    const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    // User State
    const [user, setUser] = useState<any>(null);
    const [credits, setCredits] = useState<number>(0);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        setMounted(true);
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push("/login?error=unauthorized");
                return;
            }
            setUser(user);
            fetchProfile(user.id);
            fetchHistory(user.id);
        } catch (error) {
            console.error("Auth check failed", error);
        } finally {
            setLoadingUser(false);
        }
    }

    async function fetchProfile(userId: string) {
        const { data, error } = await supabase
            .from('user_credits')
            .select('monthly_credits, bonus_credits')
            .eq('user_id', userId)
            .single();

        if (data) {
            const totalCredits = (data.monthly_credits || 0) + (data.bonus_credits || 0);
            setCredits(totalCredits);
        } else {
            setCredits(0);
        }
    }

    async function fetchHistory(userId: string) {
        // Need to ensure /api/history also uses real user or we fetch via supabase directly here
        // Ideally fetch via Supabase client directly for simplicity and RLS security
        const { data, error } = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) setHistory(data);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
            toast.success("Foto capturada com sucesso!");
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
            toast.success("Foto carregada com sucesso!");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const handleGenerate = async () => {
        if (!user) {
            toast.error("Você precisa estar logado.");
            return;
        }

        if (credits < 1) {
            toast.error("Créditos insuficientes. Recarregue para continuar.");
            return;
        }

        if (!file || !selectedModel) {
            toast.error("Por favor, selecione uma roupa e um modelo.");
            return;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            // Mock Upload logic - In prod, upload to Storage bucket first
            // For now using placeholder to not break flow if storage not set up yet fully
            // BUT schema says 'image_url' is required.
            // Let's assume for this MVP step we pass a valid URL or the mock one if just testing logic
            const garmentUrl = "https://placehold.co/600x800?text=Roupa";
            // TODO: Implement real file upload to 'generations' bucket

            const modelUrl = MODELS.find(m => m.id === selectedModel)?.url;

            // Optimistic update
            setCredits(prev => prev - 1);

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // User ID is handled by cookie in API, but we can pass it if API logic still expects verification
                    // The API we wrote uses `supabase.auth.getUser()`, so we don't strictly need to pass userId in body
                    // unless we want to double check. The API route I wrote reads from body { userId... }? 
                    // WAIT, I removed userId from body in the API route update! STARTLine 1 shows I used auth.getUser().
                    // So no need to send userId.
                    garment_image_url: garmentUrl,
                    human_image_url: modelUrl,
                    category: "tops",
                    prompt: "estudio fotogrfico, iluminao profissional, alta resoluo, 8k",
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                // Refund optimistic update
                setCredits(prev => prev + 1);
                throw new Error(data.error || "Generation failed");
            }

            setResult(data.result_url);
            toast.success("Pronto! Sua foto foi gerada.");

            // Refresh history
            fetchHistory(user.id);
            fetchProfile(user.id); // Sync exact credits

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao gerar imagem.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!mounted) return null;

    if (loadingUser) {
        return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 md:mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent w-fit">Estúdio de Criação</h1>
                    <p className="text-slate-500 text-sm md:text-base">Transforme peças de roupa em ensaios profissionais com um clique.</p>
                </div>
                <Badge variant="outline" className="text-lg py-2 px-4 border-purple-200 bg-purple-50 text-purple-700">
                    💎 {credits} Créditos
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT SIDEBAR - CONTROLS */}
                <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-8 order-2 lg:order-1">

                    {/* Upload Section */}
                    <section className="space-y-4">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">1</span>
                            Upload da Peça
                        </Label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Drag & Drop Area */}
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer relative overflow-hidden group bg-white flex flex-col items-center justify-center text-center h-40 md:h-48",
                                    isDragActive ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-slate-300"
                                )}
                            >
                                <input {...getInputProps()} />
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-purple-600 transition-colors" />
                                </div>
                                <p className="font-medium text-slate-900 text-xs md:text-sm">Galeria</p>
                                <p className="text-[10px] md:text-xs text-slate-500 mt-1">Carregar foto</p>
                            </div>

                            {/* Camera Button Area */}
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 relative overflow-hidden group bg-white hover:border-slate-300 transition-all flex flex-col items-center justify-center text-center h-40 md:h-48 cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Camera className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-purple-600 transition-colors" />
                                </div>
                                <p className="font-medium text-slate-900 text-xs md:text-sm">Câmera</p>
                                <p className="text-[10px] md:text-xs text-slate-500 mt-1">Tirar foto agora</p>
                            </div>
                        </div>

                        {preview && (
                            <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto rounded-lg overflow-hidden shadow-lg mt-4 border border-slate-100 bg-slate-50 animate-in fade-in zoom-in duration-300">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md font-medium">
                                    Peça Selecionada
                                </div>
                                <button onClick={() => setPreview(null)} className="absolute top-2 left-2 bg-white/80 p-1 rounded-full hover:bg-white text-slate-900">
                                    <Sparkles className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Model Selector */}
                    <section className="space-y-4">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">2</span>
                            Escolha o Modelo
                        </Label>

                        <div className="grid grid-cols-3 gap-3">
                            {MODELS.map((model) => (
                                <motion.div
                                    key={model.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedModel(model.id)}
                                    className={cn(
                                        "relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
                                        selectedModel === model.id ? 'border-purple-600 ring-2 ring-purple-100' : 'border-transparent opacity-70 hover:opacity-100'
                                    )}
                                >
                                    <img src={model.url} alt={model.name} className="w-full h-full object-cover" />
                                    {selectedModel === model.id && (
                                        <div className="absolute inset-0 bg-purple-600/20" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Action */}
                    <div className="pt-4 sticky bottom-4 z-30 md:static">
                        <GenerateButton
                            onClick={handleGenerate}
                            isLoading={isGenerating}
                            disabled={!file || credits < 1}
                            credits={credits}
                        />
                    </div>
                </div>


                {/* RIGHT STAGE - RESULTS */}
                <div className="lg:col-span-8 flex flex-col gap-8 order-1 lg:order-2">

                    {/* Main Result Display */}
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-3xl p-2 shadow-2xl shadow-purple-100 border border-slate-100 overflow-hidden"
                            >
                                <div className="aspect-[4/5] md:aspect-video relative rounded-2xl overflow-hidden bg-slate-100">
                                    <img src={result} alt="Resultado Gerado" className="w-full h-full object-contain" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-3xl border-2 border-dashed border-slate-200 aspect-[4/5] md:aspect-video flex flex-col items-center justify-center text-slate-400 p-8 md:p-12 text-center"
                            >
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                    <Camera className="w-8 h-8 md:w-10 md:h-10 opacity-20" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">Pronto para Criar?</h3>
                                <p className="max-w-md mx-auto text-sm md:text-base">Carregue ou tire uma foto da peça e escolha o modelo.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Gallery */}
                    <div className="space-y-6 pt-8 border-t border-slate-200/60">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Galeria Recente</h2>
                            <LayoutGrid className="w-5 h-5 text-slate-400" />
                        </div>
                        <ComparisonGallery history={history} />
                    </div>
                </div>
            </div>
        </div>
    );
}
