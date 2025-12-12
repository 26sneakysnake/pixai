/**
 * Utilitaires PDF
 */

import type { AppError } from "@/types";

/**
 * Vérifie si un fichier est un PDF valide basé sur son type MIME
 */
export function isPDFFile(file: File): boolean {
    return (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
    );
}

/**
 * Formate la taille d'un fichier en unités lisibles
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Calcule la taille totale des images extraites (en bytes, approximatif)
 * Utile pour estimer la taille de la requête à l'API
 */
export function estimateBase64Size(base64String: string): number {
    // Base64 ajoute ~33% de surcharge par rapport aux données binaires
    const padding = (base64String.match(/=/g) || []).length;
    return Math.ceil((base64String.length * 3) / 4) - padding;
}

/**
 * Vérifie si la taille totale des images est acceptable pour l'API
 * Claude a une limite de ~20MB par requête
 */
export function checkImagesSizeForAPI(
    images: { base64_data: string }[],
    maxSizeMB: number = 15
): { valid: boolean; totalSizeMB: number } {
    const totalBytes = images.reduce(
        (acc, img) => acc + estimateBase64Size(img.base64_data),
        0
    );
    const totalSizeMB = totalBytes / (1024 * 1024);

    return {
        valid: totalSizeMB <= maxSizeMB,
        totalSizeMB: Math.round(totalSizeMB * 100) / 100,
    };
}

/**
 * Messages d'erreur utilisateur-friendly pour les codes d'erreur
 */
export const ERROR_MESSAGES: Record<AppError["code"], string> = {
    PDF_INVALID: "Le fichier PDF est invalide ou corrompu. Veuillez en choisir un autre.",
    PDF_TOO_LARGE: "Le fichier PDF est trop volumineux (max 50 MB).",
    PDF_NO_PAGES: "Le PDF semble vide. Aucune page n'a été détectée.",
    AI_TIMEOUT: "L'analyse a pris trop de temps. Réessayez avec moins de pages.",
    AI_RATE_LIMIT: "Trop de requêtes. Veuillez patienter quelques minutes.",
    AI_INVALID_RESPONSE: "La réponse de l'IA est invalide. Veuillez réessayer.",
    UNKNOWN: "Une erreur inattendue s'est produite. Veuillez réessayer.",
};

/**
 * Obtient le message d'erreur utilisateur pour un code donné
 */
export function getErrorMessage(code: AppError["code"]): string {
    return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN;
}
