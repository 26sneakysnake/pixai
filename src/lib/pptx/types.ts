/**
 * Types for PPTX Template Data extraction
 */

/**
 * Placeholder text zone in a slide
 */
export interface TextPlaceholder {
    type: 'title' | 'body' | 'subtitle' | 'other';
    text: string;
    index: number;
}

/**
 * Analyzed slide from PPTX template
 */
export interface TemplateSlide {
    /** Slide index (0-based) */
    index: number;
    /** PowerPoint layout name */
    layout_name: string;
    /** Detected category */
    category: 'title' | 'content' | 'section' | 'conclusion' | 'two_column' | 'blank' | 'other';
    /** Has title placeholder */
    has_title: boolean;
    /** Has body placeholder */
    has_body: boolean;
    /** All text placeholders */
    text_placeholders: TextPlaceholder[];
    /** Raw text content */
    raw_text: string;
}

/**
 * Color palette extracted from template
 */
export interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

/**
 * Font information
 */
export interface FontInfo {
    name: string;
    usage: string;
}

/**
 * Complete template data structure
 */
export interface TemplateData {
    /** Total slides in template */
    total_slides: number;
    /** Analyzed slides */
    slides: TemplateSlide[];
    /** Extracted color palette */
    color_palette: ColorPalette;
    /** Font families used */
    fonts: {
        primary: FontInfo;
        secondary: FontInfo;
    };
}

// ===== CLONING INSTRUCTIONS OUTPUT =====

/**
 * Font specification for cloning
 */
export interface FontSpec {
    name: string;
    size: number;
    color: string;
    weight?: 'bold' | 'normal';
}

/**
 * Design specification for a cloned slide
 */
export interface SlideDesign {
    background_color: string;
    title_font: FontSpec;
    body_font: FontSpec;
}

/**
 * Template slide reference for cloning
 */
export interface TemplateSlideReference {
    /** Index of slide to clone (0-based) */
    index: number;
    /** Reason for choosing this slide */
    reason: string;
}

/**
 * Cloned slide instruction
 */
export interface ClonedSlideInstruction {
    slide_number: number;
    title: string;
    content: string;
    template_slide_reference: TemplateSlideReference;
    design: SlideDesign;
}

/**
 * Complete cloning instructions from AI
 */
export interface CloningInstructions {
    structure: {
        total_slides: number;
        story_flow: string;
    };
    slides: ClonedSlideInstruction[];
    color_palette: ColorPalette;
    fonts: {
        primary: FontInfo;
        secondary: FontInfo;
    };
}
