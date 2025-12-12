/**
 * Server Action pour analyser les slides avec Claude Vision
 */

"use server";

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { SYSTEM_PROMPT, generateAnalysisPrompt } from "./prompts";
import { validateAIResponse, type ValidatedPresentationPlan } from "./schema";
import type { AppError } from "@/types";

/**
 * Entrée de l'action d'analyse
 */
interface AnalyzeInput {
    /** Images du template en Base64 */
    templateImages: string[];
    /** Contenu texte de l'utilisateur */
    userContent: string;
    /** Langue des instructions (fr par défaut) */
    language?: "fr" | "en";
}

/**
 * Résultat de l'action d'analyse
 */
interface AnalyzeResult {
    success: boolean;
    plan?: ValidatedPresentationPlan;
    error?: AppError;
}

/**
 * Analyse les slides du template et génère un plan de présentation
 */
export async function analyzeSlides(input: AnalyzeInput): Promise<AnalyzeResult> {
    const { templateImages, userContent, language = "fr" } = input;

    // Validation des entrées
    if (!templateImages || templateImages.length === 0) {
        return {
            success: false,
            error: {
                code: "PDF_NO_PAGES",
                message: "Aucune image de template fournie",
            },
        };
    }

    if (!userContent || userContent.trim().length < 20) {
        return {
            success: false,
            error: {
                code: "UNKNOWN",
                message: "Le contenu texte est trop court (minimum 20 caractères)",
            },
        };
    }

    try {
        // Créer le client Anthropic
        const anthropic = createAnthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Préparer les images pour le modèle
        const imageContents = templateImages.map((base64, index) => ({
            type: "image" as const,
            image: base64.replace(/^data:image\/\w+;base64,/, ""),
            mimeType: "image/png" as const,
        }));

        // Générer le prompt
        const userPrompt = generateAnalysisPrompt(
            userContent,
            templateImages.length,
            language
        );

        // Appeler Claude
        const { text } = await generateText({
            model: anthropic("claude-sonnet-4-20250514"),
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: "user",
                    content: [
                        ...imageContents,
                        { type: "text", text: userPrompt },
                    ],
                },
            ],
        });

        // Valider la réponse
        const plan = validateAIResponse(text);

        return {
            success: true,
            plan,
        };
    } catch (error) {
        console.error("AI analysis error:", error);

        // Déterminer le type d'erreur
        let appError: AppError;

        if (error instanceof SyntaxError) {
            appError = {
                code: "AI_INVALID_RESPONSE",
                message: "La réponse de l'IA n'est pas un JSON valide",
                details: error.message,
            };
        } else if (error instanceof Error && error.message.includes("timeout")) {
            appError = {
                code: "AI_TIMEOUT",
                message: "L'analyse a pris trop de temps. Réessayez.",
                details: error.message,
            };
        } else if (error instanceof Error && error.message.includes("rate")) {
            appError = {
                code: "AI_RATE_LIMIT",
                message: "Trop de requêtes. Attendez quelques minutes.",
                details: error.message,
            };
        } else {
            appError = {
                code: "UNKNOWN",
                message: "Une erreur s'est produite lors de l'analyse",
                details: error instanceof Error ? error.message : String(error),
            };
        }

        return {
            success: false,
            error: appError,
        };
    }
}
