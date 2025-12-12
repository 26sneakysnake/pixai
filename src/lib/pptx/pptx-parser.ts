/**
 * PPTX Parser - Extract template data from PowerPoint files
 */

import type { TemplateData, TemplateSlide, TextPlaceholder, ColorPalette } from './types';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Dynamic import for pptx-content-extractor
let extractPptxSlides: (filePath: string) => Promise<any[]>;

async function loadExtractor() {
    if (!extractPptxSlides) {
        const module = await import('pptx-content-extractor');
        extractPptxSlides = module.extractPptxSlides || module.default?.extractPptxSlides;
    }
}

/**
 * Detect slide category based on content and structure
 */
function detectSlideCategory(
    slideText: string,
    hasTitle: boolean,
    hasBody: boolean,
    slideIndex: number,
    totalSlides: number
): TemplateSlide['category'] {
    const lowerText = slideText.toLowerCase();

    // First slide is usually title
    if (slideIndex === 0) return 'title';

    // Last slide might be conclusion
    if (slideIndex === totalSlides - 1) {
        if (lowerText.includes('merci') || lowerText.includes('thank') ||
            lowerText.includes('conclusion') || lowerText.includes('contact')) {
            return 'conclusion';
        }
    }

    // Section headers
    if (hasTitle && !hasBody && slideText.length < 100) {
        return 'section';
    }

    // Check for two-column indicators
    if (lowerText.includes('vs') || lowerText.includes('comparison')) {
        return 'two_column';
    }

    // Default content slide
    if (hasTitle && hasBody) return 'content';
    if (hasBody) return 'content';

    return 'other';
}

/**
 * Extract text placeholders from slide content
 */
function extractPlaceholders(slideData: any): TextPlaceholder[] {
    const placeholders: TextPlaceholder[] = [];

    // Try different content structures from pptx-content-extractor
    if (slideData.title) {
        placeholders.push({
            type: 'title',
            text: String(slideData.title),
            index: 0
        });
    }

    if (slideData.body) {
        const bodyText = Array.isArray(slideData.body)
            ? slideData.body.join('\n')
            : String(slideData.body);
        placeholders.push({
            type: 'body',
            text: bodyText,
            index: 1
        });
    }

    // Handle text array format
    if (slideData.text && Array.isArray(slideData.text)) {
        slideData.text.forEach((text: string, idx: number) => {
            if (idx === 0 && !slideData.title) {
                placeholders.push({ type: 'title', text, index: idx });
            } else {
                placeholders.push({ type: 'body', text, index: idx });
            }
        });
    }

    return placeholders;
}

/**
 * Extract dominant colors (placeholder - would need theme.xml parsing)
 */
function extractColorPalette(): ColorPalette {
    // Default corporate palette - in production, parse theme.xml
    return {
        primary: '#1E3A8A',      // Deep blue
        secondary: '#3B82F6',    // Blue
        accent: '#F59E0B',       // Amber
        background: '#FFFFFF',   // White
        text: '#1F2937'          // Dark gray
    };
}

/**
 * Parse PPTX file and extract template data
 */
export async function parsePptxTemplate(fileBuffer: Buffer): Promise<TemplateData> {
    await loadExtractor();

    if (!extractPptxSlides) {
        throw new Error('Failed to load pptx-content-extractor');
    }

    // Write buffer to temp file (library requires file path)
    const tempFilePath = join(tmpdir(), `pptx-${randomUUID()}.pptx`);

    try {
        await writeFile(tempFilePath, fileBuffer);

        // Extract slides from PPTX
        const slides = await extractPptxSlides(tempFilePath);

        if (!slides || slides.length === 0) {
            throw new Error('No slides found in PPTX file');
        }

        const totalSlides = slides.length;

        // Process each slide
        const templateSlides: TemplateSlide[] = slides.map((slideData, index) => {
            const placeholders = extractPlaceholders(slideData);
            const hasTitle = placeholders.some(p => p.type === 'title');
            const hasBody = placeholders.some(p => p.type === 'body');
            const rawText = placeholders.map(p => p.text).join(' ');

            return {
                index,
                layout_name: slideData.layoutName || `Slide ${index + 1}`,
                category: detectSlideCategory(rawText, hasTitle, hasBody, index, totalSlides),
                has_title: hasTitle,
                has_body: hasBody,
                text_placeholders: placeholders,
                raw_text: rawText,
            };
        });

        return {
            total_slides: totalSlides,
            slides: templateSlides,
            color_palette: extractColorPalette(),
            fonts: {
                primary: { name: 'Arial', usage: 'Titres principaux' },
                secondary: { name: 'Arial', usage: 'Corps de texte' }
            }
        };
    } finally {
        // Clean up temp file
        try {
            await unlink(tempFilePath);
        } catch {
            // Ignore cleanup errors
        }
    }
}

/**
 * Format template data as string for AI prompt
 */
export function formatTemplateDataForPrompt(data: TemplateData): string {
    const slidesDescription = data.slides.map(s =>
        `- Slide ${s.index}: category="${s.category}", layout="${s.layout_name}", ` +
        `has_title=${s.has_title}, has_body=${s.has_body}, ` +
        `placeholders=${s.text_placeholders.length}`
    ).join('\n');

    return `
Template Analysis:
- Total Slides: ${data.total_slides}

Slides:
${slidesDescription}

Color Palette:
- Primary: ${data.color_palette.primary}
- Secondary: ${data.color_palette.secondary}
- Accent: ${data.color_palette.accent}
- Background: ${data.color_palette.background}
- Text: ${data.color_palette.text}

Fonts:
- Primary: ${data.fonts.primary.name} (${data.fonts.primary.usage})
- Secondary: ${data.fonts.secondary.name} (${data.fonts.secondary.usage})
`.trim();
}
