/**
 * Hook personnalisé pour gérer le processing PDF
 * Gère l'état de conversion et les erreurs
 * NOTE: Utilise un import dynamique pour éviter le bundling SSR de pdfjs-dist
 */

"use client";

import { useState, useCallback } from "react";
import type {
    PDFExtractionResult,
    AnalysisStatus,
    AppError,
} from "@/types";

// Types uniquement (pas d'import de valeur)
export interface PDFExtractionOptions {
    scale?: number;
    pageNumbers?: number[];
    maxPages?: number;
    imageFormat?: "png" | "jpeg";
    jpegQuality?: number;
}

interface UsePDFProcessorState {
    status: AnalysisStatus;
    progress: number;
    progressMessage: string;
    result: PDFExtractionResult | null;
    error: AppError | null;
}

interface UsePDFProcessorReturn extends UsePDFProcessorState {
    processFile: (file: File, options?: PDFExtractionOptions) => Promise<void>;
    reset: () => void;
}

const initialState: UsePDFProcessorState = {
    status: "idle",
    progress: 0,
    progressMessage: "",
    result: null,
    error: null,
};

/**
 * Hook pour convertir un PDF en images
 */
export function usePDFProcessor(): UsePDFProcessorReturn {
    const [state, setState] = useState<UsePDFProcessorState>(initialState);

    const processFile = useCallback(
        async (file: File, options?: PDFExtractionOptions) => {
            setState({
                status: "extracting",
                progress: 10,
                progressMessage: "Chargement du PDF...",
                result: null,
                error: null,
            });

            try {
                setState((s) => ({
                    ...s,
                    progress: 30,
                    progressMessage: "Analyse des pages...",
                }));

                // Import dynamique à l'exécution - évite le bundling SSR
                const { convertPDFToImages } = await import("@/lib/pdf/pdf-to-images");
                const result = await convertPDFToImages(file, options);

                setState((s) => ({
                    ...s,
                    progress: 90,
                    progressMessage: "Finalisation...",
                }));

                await new Promise((resolve) => setTimeout(resolve, 300));

                setState({
                    status: "success",
                    progress: 100,
                    progressMessage: `${result.images.length} page(s) extraite(s)`,
                    result,
                    error: null,
                });
            } catch (err) {
                const appError: AppError =
                    err && typeof err === "object" && "code" in err
                        ? (err as AppError)
                        : {
                            code: "UNKNOWN",
                            message: "Une erreur inattendue s'est produite",
                            details: err,
                        };

                setState({
                    status: "error",
                    progress: 0,
                    progressMessage: "",
                    result: null,
                    error: appError,
                });
            }
        },
        []
    );

    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    return {
        ...state,
        processFile,
        reset,
    };
}
