/**
 * AI Prompts for Template Cloning Mode
 */

/**
 * System prompt for Template Cloning
 */
export const CLONING_SYSTEM_PROMPT = `Tu es un expert en design de présentations PowerPoint. Ta mission est de générer des instructions détaillées pour créer une présentation en utilisant la méthode du **Template Cloning**.

## Contexte : Template Cloning

Le Template Cloning consiste à :
1. Analyser le template PPTX que l'utilisateur a fourni
2. Identifier les différents types de slides dans ce template (titre, contenu, conclusion, etc.)
3. Pour chaque nouvelle slide à créer, choisir quelle slide du template cloner
4. Remplacer uniquement le texte dans la slide clonée (le design reste intact)

L'objectif est de produire une présentation qui conserve exactement le style visuel du template de l'utilisateur.`;

/**
 * Generate the user prompt for cloning analysis
 */
export function generateCloningPrompt(templateData: string, userContent: string): string {
    return `## Données fournies

### Template analysé
${templateData}

Cette analyse contient :
- total_slides : nombre de slides dans le template
- slides : liste des slides avec leurs caractéristiques
  - index : numéro de la slide (0 = première slide)
  - layout_name : nom du layout PowerPoint
  - category : type détecté ("title", "content", "section", "conclusion", etc.)
  - has_title : si la slide a un placeholder titre
  - has_body : si la slide a un placeholder corps de texte
  - text_placeholders : zones de texte disponibles
- color_palette : couleurs dominantes du template
- fonts : polices utilisées

### Contenu utilisateur
${userContent}

## Ta mission

Génère un JSON structuré avec les instructions pour créer chaque slide.

Pour chaque slide que tu crées, tu dois :
1. **Choisir quelle slide du template cloner** en analysant le template_data
2. **Spécifier le contenu exact** à insérer (titre et corps)
3. **Indiquer précisément** quelle slide du template utiliser

## Format de sortie OBLIGATOIRE

Tu dois répondre UNIQUEMENT avec un objet JSON valide suivant cette structure EXACTE :

{
  "structure": {
    "total_slides": [nombre],
    "story_flow": "[description du fil narratif]"
  },
  "slides": [
    {
      "slide_number": 1,
      "title": "[Titre de la slide]",
      "content": "[Contenu textuel détaillé]",
      "template_slide_reference": {
        "index": [index de la slide du template à cloner, commence à 0],
        "reason": "[Explication : pourquoi cette slide du template ?]"
      },
      "design": {
        "background_color": "[code hex depuis template_data]",
        "title_font": {
          "name": "[police depuis template_data]",
          "size": [taille],
          "color": "[code hex]",
          "weight": "bold" ou "normal"
        },
        "body_font": {
          "name": "[police depuis template_data]",
          "size": [taille],
          "color": "[code hex]"
        }
      }
    }
  ],
  "color_palette": {
    "primary": "[hex]",
    "secondary": "[hex]",
    "accent": "[hex]",
    "background": "[hex]",
    "text": "[hex]"
  },
  "fonts": {
    "primary": {
      "name": "[nom de police du template]",
      "usage": "Titres principaux"
    },
    "secondary": {
      "name": "[nom de police du template]",
      "usage": "Corps de texte"
    }
  }
}

## Règles CRITIQUES

1. **template_slide_reference.index** doit TOUJOURS être un index valide entre 0 et (total_slides - 1)
2. **Utilise UNIQUEMENT les couleurs et polices présentes dans template_data**
3. **Ne génère QUE du JSON valide**, rien d'autre (pas de markdown, pas de texte avant/après)
4. **Répartis intelligemment** : 
   - Première slide → utilise index 0 (généralement slide de titre)
   - Slides de contenu → utilise les slides de type "content" du template
   - Dernière slide → utilise une slide de type "conclusion" ou "content"

## Important

Le système va :
1. Prendre tes instructions
2. Cloner la slide du template que tu as indiquée (par son index)
3. Remplacer le texte avec le title et content que tu as spécifiés

Le design visuel (couleurs, formes, images du template) sera automatiquement préservé.

Commence maintenant la génération.`;
}
