import { fal } from "@fal-ai/client";

// The id for the idm-vton model
const MODEL_ID = "fal-ai/idm-vton";

export interface GenerationResult {
    image: {
        url: string;
        width: number;
        height: number;
        content_type: string;
    };
}

export interface GenerationRequest {
    human_image_url: string;
    garment_image_url: string;
    category: "tops" | "bottoms" | "one-pieces";
}

export const falService = {
    /**
     * Submits a generation request to the fal.ai queue
     */
    generate: async (request: GenerationRequest) => {
        try {
            const result = await fal.subscribe(MODEL_ID, {
                input: {
                    human_image_url: request.human_image_url,
                    garment_image_url: request.garment_image_url,
                    description: request.category, // idm-vton takes description as category often or we map it properly
                    category: request.category,
                },
                pollInterval: 2000,
                logs: true,
            });

            return result as unknown as GenerationResult;
        } catch (error) {
            console.error("Fal.ai generation error:", error);
            throw error;
        }
    },
};
