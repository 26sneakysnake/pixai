/**
 * Server Action for generating Template Cloning instructions
 */

"use server";

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { CLONING_SYSTEM_PROMPT, generateCloningPrompt } from "./cloning-prompts";
import { validateCloningResponse, type ValidatedCloningInstructions } from "./cloning-schema";
import { parsePptxTemplate, formatTemplateDataForPrompt } from "@/lib/pptx";
import type { AppError } from "@/types";

/**
 * Input for cloning plan generation
 */
interface CloningInput {
    /** PPTX file as Base64 string */
    pptxBase64: string;
    /** User content text */
    userContent: string;
}

/**
 * Result of cloning plan generation
 */
interface CloningResult {
    success: boolean;
    instructions?: ValidatedCloningInstructions;
    templateSummary?: string;
    error?: AppError;
}

/**
 * Generate cloning instructions from PPTX template and user content
 */
export async function generateCloningPlan(input: CloningInput): Promise<CloningResult> {
    const { pptxBase64, userContent } = input;

    // Validate inputs
    if (!pptxBase64) {
        return {
            success: false,
            error: {
                code: "UNKNOWN",
                message: "Aucun fichier PPTX fourni",
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
        // Convert Base64 to Buffer
        const base64Data = pptxBase64.replace(/^data:application\/.*?;base64,/, "");
        const fileBuffer = Buffer.from(base64Data, "base64");

        // Parse PPTX template
        const templateData = await parsePptxTemplate(fileBuffer);
        const templateDataStr = formatTemplateDataForPrompt(templateData);

        // Create Anthropic client
        const anthropic = createAnthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Generate cloning prompt
        const userPrompt = generateCloningPrompt(templateDataStr, userContent);

        // Call Claude
        const { text } = await generateText({
            model: anthropic("claude-sonnet-4-20250514"),
            system: CLONING_SYSTEM_PROMPT,
            messages: [
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
        });

        // Validate response
        const instructions = validateCloningResponse(text);

        // Validate slide references are within bounds
        for (const slide of instructions.slides) {
            if (slide.template_slide_reference.index >= templateData.total_slides) {
                throw new Error(
                    `Invalid template reference: slide index ${slide.template_slide_reference.index} ` +
                    `exceeds template size (${templateData.total_slides} slides)`
                );
            }
        }

        return {
            success: true,
            instructions,
            templateSummary: `Template: ${templateData.total_slides} slides parsed`,
        };
    } catch (error) {
        console.error("Cloning plan generation error:", error);

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
        } else if (error instanceof Error && error.message.includes("PPTX")) {
            appError = {
                code: "PDF_INVALID",
                message: "Erreur lors de l'analyse du fichier PPTX",
                details: error.message,
            };
        } else {
            appError = {
                code: "UNKNOWN",
                message: "Une erreur s'est produite lors de la génération",
                details: error instanceof Error ? error.message : String(error),
            };
        }

        return {
            success: false,
            error: appError,
        };
    }
}
