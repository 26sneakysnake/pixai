/**
 * Zod Schema for Template Cloning AI Response
 */

import { z } from 'zod';

/**
 * Font specification schema
 */
export const FontSpecSchema = z.object({
    name: z.string(),
    size: z.number(),
    color: z.string(),
    weight: z.enum(['bold', 'normal']).optional()
});

/**
 * Slide design schema
 */
export const SlideDesignSchema = z.object({
    background_color: z.string(),
    title_font: FontSpecSchema,
    body_font: FontSpecSchema
});

/**
 * Template slide reference schema
 */
export const TemplateSlideReferenceSchema = z.object({
    index: z.number().int().min(0),
    reason: z.string()
});

/**
 * Cloned slide instruction schema
 */
export const ClonedSlideInstructionSchema = z.object({
    slide_number: z.number().int().positive(),
    title: z.string(),
    content: z.string(),
    template_slide_reference: TemplateSlideReferenceSchema,
    design: SlideDesignSchema
});

/**
 * Font info schema
 */
export const FontInfoSchema = z.object({
    name: z.string(),
    usage: z.string()
});

/**
 * Color palette schema
 */
export const ColorPaletteSchema = z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string()
});

/**
 * Complete cloning instructions schema
 */
export const CloningInstructionsSchema = z.object({
    structure: z.object({
        total_slides: z.number().int().positive(),
        story_flow: z.string()
    }),
    slides: z.array(ClonedSlideInstructionSchema),
    color_palette: ColorPaletteSchema,
    fonts: z.object({
        primary: FontInfoSchema,
        secondary: FontInfoSchema
    })
});

/**
 * Inferred TypeScript type
 */
export type ValidatedCloningInstructions = z.infer<typeof CloningInstructionsSchema>;

/**
 * Validate and parse AI cloning response
 */
export function validateCloningResponse(response: string): ValidatedCloningInstructions {
    // Clean response (sometimes wrapped in markdown)
    let jsonStr = response.trim();

    // Extract JSON if wrapped in backticks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1];
    }

    // Parse JSON
    const parsed = JSON.parse(jsonStr);

    // Validate with Zod
    return CloningInstructionsSchema.parse(parsed);
}
