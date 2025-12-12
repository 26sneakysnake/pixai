/**
 * PPTX Generator with pptx-automizer
 * Clone slides and replace text to generate new PPTX
 */

import Automizer from 'pptx-automizer';
import { writeFile, unlink, mkdir, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { CloningInstructions } from './types';

/**
 * Generate a new PPTX by cloning slides using pptx-automizer
 */
export async function generatePptxFromInstructions(
    templateBuffer: Buffer,
    instructions: CloningInstructions
): Promise<Buffer> {
    // Create temp directory for pptx-automizer
    const tempId = randomUUID();
    const tempDir = join(tmpdir(), `pptx-gen-${tempId}`);
    const templatePath = join(tempDir, 'template.pptx');
    const outputPath = join(tempDir, 'output.pptx');

    try {
        // Create temp directory
        await mkdir(tempDir, { recursive: true });

        // Write template to temp file
        await writeFile(templatePath, templateBuffer);

        // Initialize Automizer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const automizer = new (Automizer as any)({
            templateDir: tempDir,
            outputDir: tempDir,
            removeExistingSlides: true,
        });

        // Load the template
        automizer
            .loadRoot('template.pptx')
            .load('template.pptx', 'tpl');

        // Get total slides count from instructions
        const templateSlideCount = instructions.structure?.total_slides || 10;

        // Add slides based on instructions (clone the appropriate slide from template)
        for (const instruction of instructions.slides) {
            let sourceSlideNum = instruction.template_slide_reference.index + 1; // 1-based

            // Ensure within bounds
            if (sourceSlideNum > templateSlideCount) {
                sourceSlideNum = ((sourceSlideNum - 1) % templateSlideCount) + 1;
            }
            if (sourceSlideNum < 1) {
                sourceSlideNum = 1;
            }

            // Add slide from template
            // Note: pptx-automizer copies the entire slide with its original content
            // Text replacement would require additional XML manipulation
            automizer.addSlide('tpl', sourceSlideNum);
        }

        // Generate the output
        await automizer.write('output.pptx');

        // Read and return output buffer
        const outputBuffer = await readFile(outputPath);

        return outputBuffer;
    } finally {
        // Cleanup temp files
        try {
            await unlink(templatePath).catch(() => { });
            await unlink(outputPath).catch(() => { });
        } catch {
            // Ignore cleanup errors
        }
    }
}
