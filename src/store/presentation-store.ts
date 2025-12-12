/**
 * Presentation Store
 * Gestion d'état globale avec Zustand
 */

import { create } from "zustand";
import type {
    AnalysisStatus,
    PDFExtractionResult,
    PresentationPlan,
    AppError,
} from "@/types";

interface PresentationState {
    // État du PDF
    pdfResult: PDFExtractionResult | null;
    selectedPageIndices: number[];

    // Contenu utilisateur
    userContent: string;

    // État de l'analyse
    analysisStatus: AnalysisStatus;
    analysisProgress: number;
    analysisMessage: string;

    // Résultat
    presentationPlan: PresentationPlan | null;
    error: AppError | null;

    // Actions
    setPdfResult: (result: PDFExtractionResult | null) => void;
    setSelectedPages: (indices: number[]) => void;
    setUserContent: (content: string) => void;
    startAnalysis: () => void;
    updateAnalysisProgress: (progress: number, message: string) => void;
    setAnalysisResult: (plan: PresentationPlan) => void;
    setAnalysisError: (error: AppError) => void;
    reset: () => void;
    resetAnalysis: () => void;
}

const initialState = {
    pdfResult: null,
    selectedPageIndices: [],
    userContent: "",
    analysisStatus: "idle" as AnalysisStatus,
    analysisProgress: 0,
    analysisMessage: "",
    presentationPlan: null,
    error: null,
};

export const usePresentationStore = create<PresentationState>((set) => ({
    ...initialState,

    setPdfResult: (result) =>
        set({
            pdfResult: result,
            // Sélectionner toutes les pages par défaut
            selectedPageIndices: result
                ? result.images.map((_, i) => i)
                : [],
        }),

    setSelectedPages: (indices) =>
        set({ selectedPageIndices: indices }),

    setUserContent: (content) =>
        set({ userContent: content }),

    startAnalysis: () =>
        set({
            analysisStatus: "analyzing",
            analysisProgress: 0,
            analysisMessage: "Envoi à l'IA...",
            error: null,
        }),

    updateAnalysisProgress: (progress, message) =>
        set({
            analysisProgress: progress,
            analysisMessage: message,
        }),

    setAnalysisResult: (plan) =>
        set({
            analysisStatus: "success",
            analysisProgress: 100,
            analysisMessage: "Analyse terminée !",
            presentationPlan: plan,
            error: null,
        }),

    setAnalysisError: (error) =>
        set({
            analysisStatus: "error",
            analysisProgress: 0,
            analysisMessage: "",
            error,
        }),

    reset: () => set(initialState),

    resetAnalysis: () =>
        set({
            analysisStatus: "idle",
            analysisProgress: 0,
            analysisMessage: "",
            presentationPlan: null,
            error: null,
        }),
}));
