/**
 * PPTX Module - Entry point
 */

export * from './types';
export { parsePptxTemplate, formatTemplateDataForPrompt } from './pptx-parser';
export { generatePptxFromInstructions } from './pptx-generator';

