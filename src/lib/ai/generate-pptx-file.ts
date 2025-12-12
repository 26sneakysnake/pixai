/**
 * Server Action for generating PPTX file from cloning instructions
 */

"use server";

import { generatePptxFromInstructions } from "@/lib/pptx/pptx-generator";
import type { CloningInstructions } from "@/lib/pptx/types";

/**
 * Input for PPTX generation
 */
interface GeneratePptxInput {
    /** Original PPTX template as Base64 */
    pptxBase64: string;
    /** Cloning instructions from Claude */
    instructions: CloningInstructions;
}

/**
 * Result of PPTX generation
 */
interface GeneratePptxResult {
    success: boolean;
    /** Generated PPTX file as Base64 */
    fileBase64?: string;
    /** Filename for download */
    fileName?: string;
    error?: string;
}

/**
 * Generate a new PPTX file from template and cloning instructions
 */
export async function generatePptxFile(input: GeneratePptxInput): Promise<GeneratePptxResult> {
    const { pptxBase64, instructions } = input;

    if (!pptxBase64) {
        return {
            success: false,
            error: "Aucun fichier template fourni",
        };
    }

    if (!instructions || !instructions.slides || instructions.slides.length === 0) {
        return {
            success: false,
            error: "Aucune instruction de clonage fournie",
        };
    }

    try {
        // Convert Base64 to Buffer
        const base64Data = pptxBase64.replace(/^data:application\/.*?;base64,/, "");
        const templateBuffer = Buffer.from(base64Data, "base64");

        // Generate new PPTX
        const outputBuffer = await generatePptxFromInstructions(templateBuffer, instructions);

        // Convert back to Base64
        const outputBase64 = outputBuffer.toString("base64");
        const dataUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${outputBase64}`;

        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 10);
        const fileName = `presentation-generated-${timestamp}.pptx`;

        return {
            success: true,
            fileBase64: dataUrl,
            fileName,
        };
    } catch (error) {
        console.error("PPTX generation error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la génération du PPTX",
        };
    }
}
