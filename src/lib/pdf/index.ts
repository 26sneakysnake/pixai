// Re-export utilities only (these don't use pdfjs-dist)
export {
    isPDFFile,
    formatFileSize,
    estimateBase64Size,
    checkImagesSizeForAPI,
    getErrorMessage,
    ERROR_MESSAGES,
} from "./pdf-utils";

// Types only - safe for SSR
export type { PDFExtractionOptions } from "./pdf-to-images";

// NOTE: convertPDFToImages should be imported dynamically:
// const { convertPDFToImages } = await import("@/lib/pdf/pdf-to-images");
