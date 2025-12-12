/**
 * PDF to Images Converter
 * Charge pdfjs-dist via script externe pour éviter le bundling
 */

import type { PDFPageImage, PDFExtractionResult, AppError } from "@/types";

export interface PDFExtractionOptions {
    scale?: number;
    pageNumbers?: number[];
    maxPages?: number;
    imageFormat?: "png" | "jpeg";
    jpegQuality?: number;
}

const DEFAULT_OPTIONS: Required<PDFExtractionOptions> = {
    scale: 1.5,
    pageNumbers: [],
    maxPages: 20,
    imageFormat: "png",
    jpegQuality: 0.85,
};

// Version de pdfjs-dist utilisée
const PDFJS_VERSION = "3.11.174";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

// Cache pour le chargement du script
let pdfjsPromise: Promise<typeof window.pdfjsLib> | null = null;

/**
 * Types pour pdfjs-dist (global window)
 */
declare global {
    interface Window {
        pdfjsLib: {
            GlobalWorkerOptions: { workerSrc: string };
            getDocument: (options: { data: ArrayBuffer }) => {
                promise: Promise<PDFDocument>;
            };
        };
    }
}

interface PDFDocument {
    numPages: number;
    getPage: (num: number) => Promise<PDFPage>;
}

interface PDFPage {
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => {
        promise: Promise<void>;
    };
}

/**
 * Charge pdfjs-dist via CDN
 */
async function loadPdfJs(): Promise<typeof window.pdfjsLib> {
    // Vérifier si déjà chargé
    if (typeof window !== "undefined" && window.pdfjsLib) {
        return window.pdfjsLib;
    }

    // Utiliser le cache
    if (pdfjsPromise) {
        return pdfjsPromise;
    }

    pdfjsPromise = new Promise((resolve, reject) => {
        // Charger le script principal
        const script = document.createElement("script");
        script.src = `${PDFJS_CDN}/pdf.min.js`;
        script.async = true;

        script.onload = () => {
            // Configurer le worker
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
            resolve(window.pdfjsLib);
        };

        script.onerror = () => {
            pdfjsPromise = null;
            reject(new Error("Impossible de charger la bibliothèque PDF"));
        };

        document.head.appendChild(script);
    });

    return pdfjsPromise;
}

/**
 * Convertit un fichier PDF en un tableau d'images Base64
 */
export async function convertPDFToImages(
    file: File,
    options: PDFExtractionOptions = {}
): Promise<PDFExtractionResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Validation
    if (!file.type.includes("pdf")) {
        throw createAppError("PDF_INVALID", "Le fichier doit être un PDF valide");
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        throw createAppError("PDF_TOO_LARGE", "Le fichier PDF ne doit pas dépasser 50 MB");
    }

    try {
        // Charger pdfjs via CDN
        const pdfjsLib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (pdf.numPages === 0) {
            throw createAppError("PDF_NO_PAGES", "Le PDF ne contient aucune page");
        }

        const pagesToExtract = getPageNumbers(pdf.numPages, opts);
        const images: PDFPageImage[] = [];

        for (const pageNum of pagesToExtract) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: opts.scale });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            const mimeType = opts.imageFormat === "jpeg" ? "image/jpeg" : "image/png";
            const quality = opts.imageFormat === "jpeg" ? opts.jpegQuality : undefined;

            images.push({
                page_index: pageNum - 1,
                base64_data: canvas.toDataURL(mimeType, quality),
                width: Math.round(viewport.width),
                height: Math.round(viewport.height),
            });
        }

        return { file_name: file.name, total_pages: pdf.numPages, images };
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("PDF processing error:", error);
        throw createAppError(
            "PDF_INVALID",
            "Impossible de lire le PDF. Vérifiez qu'il n'est pas protégé ou corrompu.",
            error
        );
    }
}

function getPageNumbers(totalPages: number, options: Required<PDFExtractionOptions>): number[] {
    if (options.pageNumbers.length > 0) {
        return options.pageNumbers.filter((n) => n >= 1 && n <= totalPages).slice(0, options.maxPages);
    }
    return Array.from({ length: Math.min(totalPages, options.maxPages) }, (_, i) => i + 1);
}

function createAppError(code: AppError["code"], message: string, details?: unknown): AppError {
    return { code, message, details };
}

function isAppError(error: unknown): error is AppError {
    return typeof error === "object" && error !== null && "code" in error && "message" in error;
}

export async function extractKeyPages(
    file: File,
    options: PDFExtractionOptions = {}
): Promise<PDFExtractionResult> {
    const pdfjsLib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const keyPages = new Set<number>([1]);
    if (pdf.numPages > 1) {
        keyPages.add(Math.ceil(pdf.numPages / 2));
        keyPages.add(pdf.numPages);
    }
    if (pdf.numPages > 5) {
        keyPages.add(2);
        keyPages.add(Math.ceil(pdf.numPages / 4));
    }

    return convertPDFToImages(file, {
        ...DEFAULT_OPTIONS,
        ...options,
        pageNumbers: Array.from(keyPages).sort((a, b) => a - b),
    });
}
