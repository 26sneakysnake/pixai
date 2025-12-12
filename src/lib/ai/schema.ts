/**
 * Schéma Zod pour valider la réponse de Claude
 */

import { z } from "zod";

/**
 * Types de layouts supportés
 */
export const SlideLayoutTypeSchema = z.enum([
    "title",
    "title_content",
    "bullet_points",
    "image_text",
    "two_columns",
    "quote",
    "section_header",
    "blank",
]);

/**
 * Contenu d'une slide
 */
/**
 * Contenu d'une slide
 */
/**
 * Instruction de modification précise
 */
export const ModificationSchema = z.object({
    target_element: z.string().describe("L'élément visuel du template à modifier (ex: 'Grand titre', 'Image cercle')"),
    action: z.string().describe("L'action précise (ex: 'Remplacer le texte', 'Changer l'image')"),
    value: z.string().describe("La nouvelle valeur ou contenu à insérer"),
    style_details: z.string().optional().describe("Détails de style (police, couleur, taille)"),
});

/**
 * Contenu d'une slide
 */
export const SlideContentSchema = z.object({
    title: z.string(),
    body: z.array(z.string()),
    modifications: z.array(ModificationSchema).optional().describe("Liste étape par étape des modifications à appliquer sur le template"),
    visual_notes: z.string().optional(),
});

/**
 * Instruction pour une slide
 */
export const SlideInstructionSchema = z.object({
    slide_number: z.number().int().positive(),
    layout_type: SlideLayoutTypeSchema,
    reference_image_index: z.number().int().min(0),
    content_to_use: SlideContentSchema,
    design_instructions: z.string(),
    font_suggestions: z.object({
        primary: z.string().optional(),
        secondary: z.string().optional(),
        sizes: z.string().optional()
    }).optional(),
});

/**
 * Plan de présentation complet
 */
export const PresentationPlanSchema = z.object({
    presentation_title: z.string(),
    total_slides: z.number().int().positive(),
    style_notes: z.string().optional(),
    slides: z.array(SlideInstructionSchema),
});

/**
 * Type inféré du schéma
 */
export type ValidatedPresentationPlan = z.infer<typeof PresentationPlanSchema>;

/**
 * Valide et parse la réponse JSON de Claude
 */
export function validateAIResponse(response: string): ValidatedPresentationPlan {
    // Nettoyer la réponse (parfois entourée de markdown)
    let jsonStr = response.trim();

    // Extraire le JSON si entouré de backticks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1];
    }

    // Parser le JSON
    const parsed = JSON.parse(jsonStr);

    // Valider avec Zod
    return PresentationPlanSchema.parse(parsed);
}
