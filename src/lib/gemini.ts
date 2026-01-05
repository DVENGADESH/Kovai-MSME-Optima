import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini
// Note: In production, call via backend to protect key. For MVP, client-side is acceptable.
const genAI = new GoogleGenerativeAI(API_KEY || "PLACEHOLDER_KEY");

const MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash-002"];

// Helper to attempt generation with fallback models
const generateWithFallback = async (parts: any[]) => {
    let lastError: any;

    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`Attempting Gemini API with model: ${modelName} (v1)`);
            // Explicitly requesting v1 API version for 2026 compatibility
            const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

            const result = await model.generateContent(parts);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }
    throw lastError || new Error("All Gemini models failed to respond. Please check API key/quota.");
};

// Helper to separate Base64 data from the Data URL scheme
const blobToGenerativePart = async (blob: Blob) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Robust split: handles data:image/png;base64, prefix if present, or raw base64
            const base64Data = result.split(',')[1] || result;
            resolve(base64Data);
        };
        reader.readAsDataURL(blob);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: blob.type },
    };
};

export interface BillAnalysisResult {
    totalConsumption: string;
    peakCharges: string;
    fixedCharges: string;
    savingsPotential: string;
    recommendations: string[];
}

export const analyzeBill = async (imageFile: File, _language: 'en' | 'ta'): Promise<BillAnalysisResult> => {
    if (!API_KEY || API_KEY.includes('PLACEHOLDER')) {
        throw new Error("Gemini API Key is missing. Please check .env.local");
    }

    const imagePart = await blobToGenerativePart(imageFile);

    // Explicit 2026 TANGEDCO Rates for Coimbatore Industrial High Tension/Low Tension
    const prompt = `
    Analyze this TANGEDCO electricity bill for a Coimbatore industrial unit. 
    Strictly use these 2026 Rates:
    - Normal Hours: ₹7.50 / unit
    - Peak Hours (06:00-10:00 & 18:00-22:00): ₹9.38 / unit (25% surcharge)
    - Night Hours (22:00-05:00): ₹7.13 / unit (5% discount)

    Extract/Calculate:
    1. Total Consumption (Units)
    2. Peak Hour Charges (if not explicitly shown, calculate based on ~25% usage or provided data)
    3. Fixed Charges/Demand Charges
    4. Savings Potential: Calculate cost difference if 20% of Peak Load (₹9.38) is shifted to Night Hours (₹7.13). Saving = (PeakUnits * 0.20) * (9.38 - 7.13).

    Output JSON Only: 
    { "totalConsumption": "value units", "peakCharges": "₹value", "fixedCharges": "₹value", "savingsPotential": "₹value", "recommendations": ["Technical action 1", "Technical action 2"] }
    `;

    try {
        const text = await generateWithFallback([prompt, imagePart]);

        const jsonBlock = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        const jsonString = jsonBlock ? jsonBlock[0].replace(/```json|```/g, '') : text;

        return JSON.parse(jsonString);
    } catch (error: any) {
        console.error("Gemini Scan Error:", error.message);
        throw new Error(`Failed to analyze bill: ${error.message}`);
    }
};

export interface AudioAnalysisResult {
    status: 'Healthy' | 'Warning' | 'Critical';
    healthScore: number;
    description: string;
    maintenanceTips: string[];
}

export const analyzeAudio = async (audioBlob: Blob, language: 'en' | 'ta'): Promise<AudioAnalysisResult> => {
    if (!API_KEY || API_KEY.includes('PLACEHOLDER')) {
        throw new Error("Gemini API Key is missing. Please check .env.local");
    }

    // Use the unified helper which correctly passes the Blob's mimeType (e.g. audio/webm;codecs=opus)
    const audioPart = await blobToGenerativePart(audioBlob);

    const prompt = language === 'ta'
        ? "இந்த இயந்திர ஒலியை கேளுங்கள். முடிவு JSON: { status: 'Healthy' | 'Warning' | 'Critical', healthScore: number (0-100), description: 'விளக்கம்', maintenanceTips: [] }."
        : "Analyze this machine audio. Return JSON: { status: 'Healthy' | 'Warning' | 'Critical', healthScore: number (0-100), description: 'technical diagnosis', maintenanceTips: ['step 1'] }.";

    try {
        const text = await generateWithFallback([prompt, audioPart]);
        console.log("Gemini Raw Response:", text); // Debug Log

        const jsonBlock = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        const jsonString = jsonBlock ? jsonBlock[0].replace(/```json|```/g, '') : text;

        return JSON.parse(jsonString);
    } catch (error: any) {
        console.error("Gemini Audio Error:", error.message);
        throw new Error(`Failed to analyze audio: ${error.message}`);
    }
}
