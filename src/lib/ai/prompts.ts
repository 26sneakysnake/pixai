/**
 * Prompts pour l'analyse de slides par Claude Vision
 */

/**
 * Prompt système pour guider Claude
 */
export const SYSTEM_PROMPT = `Tu es un expert en design de présentations. Ton rôle est d'analyser des templates de présentation (images de slides) et de créer un plan détaillé pour transformer du contenu texte brut en une présentation professionnelle.

## Tes compétences :
- Analyser le style visuel des slides (couleurs, typographie, mise en page)
- Identifier les types de layouts (titre, listes, image+texte, etc.)
- Mapper le contenu utilisateur sur les layouts appropriés
- Donner des instructions de design précises et actionnables

## Format de sortie :
Tu dois TOUJOURS répondre en JSON valide suivant exactement le schéma fourni.
Ne jamais inclure de texte avant ou après le JSON.`;

/**
 * Génère le prompt utilisateur pour l'analyse
 */
export function generateAnalysisPrompt(
  userContent: string,
  templateImagesCount: number,
  language: "fr" | "en" = "fr"
): string {
  const labels = language === "fr"
    ? {
      task: "Tâche",
      template: "Template fourni",
      images: "images de slides",
      content: "Contenu à transformer",
      instructions: "Instructions",
      analyze: "Analyse chaque image du template pour comprendre",
      style: "le style visuel (couleurs, polices, espacements)",
      layout: "les types de layouts disponibles",
      elements: "les éléments visuels récurrents",
      create: "Crée un plan de présentation en mappant le contenu sur les layouts",
      respond: "Réponds uniquement avec un objet JSON valide",
    }
    : {
      task: "Task",
      template: "Template provided",
      images: "slide images",
      content: "Content to transform",
      instructions: "Instructions",
      analyze: "Analyze each template image to understand",
      style: "visual style (colors, fonts, spacing)",
      layout: "available layout types",
      elements: "recurring visual elements",
      create: "Create a presentation plan by mapping content to layouts",
      respond: "Respond only with a valid JSON object",
    };

  return `## ${labels.task}

### ${labels.template}
${templateImagesCount} ${labels.images}

### ${labels.content}
"""
${userContent}
"""

### ${labels.instructions}
1. ${labels.analyze}:
   - ${labels.style}
   - ${labels.layout}
   - ${labels.elements}

2. ${labels.create}

3. ${labels.respond} suivant ce schéma exact:

\`\`\`json
{
  "presentation_title": "string - titre suggéré",
  "total_slides": number,
  "style_notes": "string - notes sur le style détecté",
  "slides": [
    {
      "slide_number": number,
      "layout_type": "title" | "title_content" | "bullet_points" | "image_text" | "two_columns" | "quote" | "section_header" | "blank",
      "reference_image_index": number (0-based),
      "content_to_use": {
        "title": "string",
        "body": ["string (markdown allowed)"],
        "modifications": [
          {
            "target_element": "string - Élément visuel VISÉ (ex: 'Grand titre NOMADE', 'Image ronde')",
            "action": "string - Action (ex: 'Remplacer le texte', 'Changer l'image')",
            "value": "string - Nouveau contenu",
            "style_details": "string - Détails police/taille/couleur (ex: 'Garder Serif 48px', 'Utiliser vert forêt')"
          }
        ],
        "visual_notes": "string optionnel"
      },
      "design_instructions": "string - instructions globales",
      "font_suggestions": {
        "primary": "string - ex: 'Playfair Display'",
        "secondary": "string - ex: 'Lato'",
        "sizes": "string - ex: 'H1: 48px, Body: 16px'"
      }
    }
  ]
}
\`\`\`

IMPORTANT: 
- SOIS TRÈS PRÉCIS sur les 'modifications'. Découpe chaque changement en une étape.
- Donne des détails visuels (police, taille approximative) dans 'style_details'.
- Le contenu 'body' doit être en MARKDOWN.
`;
}

/**
 * Prompt de fallback si le contenu est trop court
 */
export const MINIMAL_CONTENT_PROMPT = `Le contenu fourni est très court. Crée une présentation simple de 3-5 slides maximum en utilisant les layouts les plus appropriés du template.`;
