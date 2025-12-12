// ============================================
// SLIDE ARCHITECT AI - TYPE DEFINITIONS
// ============================================

/**
 * Types de layouts détectables par l'IA
 */
export type SlideLayoutType =
  | "title"           // Slide de titre
  | "title_content"   // Titre + contenu texte
  | "bullet_points"   // Liste à puces
  | "image_text"      // Image + texte côte à côte
  | "two_columns"     // Deux colonnes
  | "quote"           // Citation
  | "section_header"  // Séparateur de section
  | "blank";          // Slide vierge

// ============================================
// CONTENU D'UNE SLIDE
// ============================================

export interface Modification {
  target_element: string;
  action: string;
  value: string;
  style_details?: string;
}

/**
 * Contenu à placer sur une slide spécifique
 */
export interface SlideContent {
  /** Titre principal de la slide */
  title: string;
  /** Corps du texte (paragraphes ou puces) */
  body: string[];
  /** Liste étape par étape des modifications */
  modifications?: Modification[];
  /** Notes visuelles pour l'utilisateur */
  visual_notes?: string;
}

// ============================================
// INSTRUCTION POUR UNE SLIDE
// ============================================

/**
 * Instructions générées par l'IA pour une slide
 */
export interface SlideInstruction {
  /** Numéro de la slide dans la présentation finale */
  slide_number: number;
  /** Type de layout recommandé */
  layout_type: SlideLayoutType;
  /** Index de l'image du template PDF à imiter (0-based) */
  reference_image_index: number;
  /** Contenu à utiliser */
  content_to_use: SlideContent;
  /** Instructions de design (couleurs, alignement, etc.) */
  design_instructions: string;
  /** Suggestions typographiques */
  font_suggestions?: {
    primary?: string;
    secondary?: string;
    sizes?: string;
  };
}

// ============================================
// PLAN DE PRÉSENTATION (RÉPONSE IA)
// ============================================

/**
 * Structure complète retournée par Claude
 * C'est le schéma de réponse attendu de l'IA
 */
export interface PresentationPlan {
  /** Titre suggéré pour la présentation */
  presentation_title: string;
  /** Nombre total de slides recommandées */
  total_slides: number;
  /** Instructions détaillées par slide */
  slides: SlideInstruction[];
  /** Notes générales sur le style détecté */
  style_notes?: string;
}

// ============================================
// REPRÉSENTATION D'UNE PAGE PDF
// ============================================

/**
 * Image extraite d'une page PDF
 */
export interface PDFPageImage {
  /** Index de la page (0-based) */
  page_index: number;
  /** Image en Base64 (data:image/png;base64,...) */
  base64_data: string;
  /** Largeur originale en pixels */
  width: number;
  /** Hauteur originale en pixels */
  height: number;
}

/**
 * Résultat complet de l'extraction PDF
 */
export interface PDFExtractionResult {
  /** Nom du fichier original */
  file_name: string;
  /** Nombre total de pages */
  total_pages: number;
  /** Images extraites */
  images: PDFPageImage[];
}

// ============================================
// REQUÊTE D'ANALYSE
// ============================================

/**
 * Données envoyées à l'API pour analyse
 */
export interface AnalysisRequest {
  /** Images du template PDF (Base64) */
  template_images: string[];
  /** Contenu texte fourni par l'utilisateur */
  user_content: string;
  /** Options additionnelles */
  options?: AnalysisOptions;
}

/**
 * Options de personnalisation de l'analyse
 */
export interface AnalysisOptions {
  /** Langue souhaitée pour les instructions */
  language?: "fr" | "en";
  /** Nombre max de slides */
  max_slides?: number;
}

// ============================================
// ÉTATS DU PROCESSUS
// ============================================

/**
 * États possibles du processus d'analyse
 */
export type AnalysisStatus =
  | "idle"           // En attente
  | "uploading"      // Upload en cours
  | "extracting"     // Extraction PDF → Images
  | "analyzing"      // Analyse IA en cours
  | "success"        // Terminé avec succès
  | "error";         // Erreur

/**
 * État complet de l'application
 */
export interface AnalysisState {
  /** Statut actuel */
  status: AnalysisStatus;
  /** Message de progression */
  progress_message?: string;
  /** Pourcentage de progression (0-100) */
  progress_percent?: number;
  /** Résultat de l'extraction PDF */
  pdf_result?: PDFExtractionResult;
  /** Plan généré par l'IA */
  presentation_plan?: PresentationPlan;
  /** Message d'erreur si status = "error" */
  error_message?: string;
}

// ============================================
// ERREURS MÉTIER
// ============================================

/**
 * Codes d'erreur spécifiques à l'application
 */
export type AppErrorCode =
  | "PDF_INVALID"          // PDF corrompu/illisible
  | "PDF_TOO_LARGE"        // PDF trop volumineux
  | "PDF_NO_PAGES"         // PDF vide
  | "AI_TIMEOUT"           // Timeout API Claude
  | "AI_RATE_LIMIT"        // Rate limit atteint
  | "AI_INVALID_RESPONSE"  // Réponse IA non parsable
  | "UNKNOWN";             // Erreur inconnue

/**
 * Erreur applicative typée
 */
export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: unknown;
}
