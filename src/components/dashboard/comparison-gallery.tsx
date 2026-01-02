"use client";

import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComparisonGalleryProps {
    history: any[];
}

export function ComparisonGallery({ history }: ComparisonGalleryProps) {
    if (history.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300">
                <p>No generations yet. Start creating!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((item) => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-[3/4] relative">
                        <ReactCompareSlider
                            itemOne={<ReactCompareSliderImage src={item.image_url} alt="Original Garment" />}
                            itemTwo={<ReactCompareSliderImage src={item.result_url || item.image_url} alt="Generated Model" />}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" onClick={() => window.open(item.result_url, '_blank')}>
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-3 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-500">
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        <span className="uppercase font-medium tracking-wider">{item.clothing_type}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
