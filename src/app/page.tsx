/**
 * SlideArchitect AI - Page principale
 * Interface pour créer des présentations assistées par IA
 */

"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DynamicPDFUploader as PDFUploader } from "@/components/pdf";
import { TextInput } from "@/components/text";
import { SlidePlan } from "@/components/results";
import { UserMenu } from "@/components/auth";
import { usePresentationStore } from "@/store/presentation-store";
import type { PDFExtractionResult } from "@/types";

export default function Home() {
  const {
    pdfResult,
    selectedPageIndices,
    userContent,
    analysisStatus,
    analysisProgress,
    analysisMessage,
    presentationPlan,
    error,
    setPdfResult,
    setSelectedPages,
    setUserContent,
    startAnalysis,
    reset,
    resetAnalysis,
  } = usePresentationStore();

  // Étape actuelle (1: Upload, 2: Contenu, 3: Résultats)
  const [currentStep, setCurrentStep] = useState(1);

  // Callback quand le PDF est extrait
  const handlePdfExtracted = useCallback(
    (result: PDFExtractionResult) => {
      setPdfResult(result);
      setCurrentStep(2);
    },
    [setPdfResult]
  );

  // Lancer l'analyse avec Claude
  const handleAnalyze = useCallback(async () => {
    if (!pdfResult || !userContent.trim()) return;

    startAnalysis();
    setCurrentStep(3);

    try {
      // Import dynamique du server action
      const { analyzeSlides } = await import("@/lib/ai");

      // Récupérer les images sélectionnées
      const selectedImages = selectedPageIndices.map(
        (idx) => pdfResult.images[idx]?.base64_data
      ).filter(Boolean);

      // Appeler Claude pour l'analyse
      const result = await analyzeSlides({
        templateImages: selectedImages,
        userContent: userContent.trim(),
        language: "fr",
      });

      if (result.success && result.plan) {
        // Mettre à jour le store avec le résultat
        usePresentationStore.getState().setAnalysisResult(result.plan);
      } else if (result.error) {
        usePresentationStore.getState().setAnalysisError(result.error);
      }
    } catch (err) {
      usePresentationStore.getState().setAnalysisError({
        code: "UNKNOWN",
        message: "Une erreur s'est produite lors de l'analyse",
        details: err,
      });
    }
  }, [pdfResult, userContent, selectedPageIndices, startAnalysis]);

  // Réinitialiser
  const handleReset = useCallback(() => {
    reset();
    setCurrentStep(1);
  }, [reset]);

  // Retour à l'étape précédente
  const handleBack = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      resetAnalysis();
      setCurrentStep(2);
    }
  }, [currentStep, resetAnalysis]);

  // Vérifier si on peut analyser
  const canAnalyze =
    pdfResult &&
    selectedPageIndices.length > 0 &&
    userContent.trim().length > 20;

  const isAnalyzing = analysisStatus === "analyzing";

  return (
    <div className="min-h-screen bg-slate-950 bg-grid-pattern">
      {/* Header - Glassmorphism */}
      <header className="border-b border-white/10 glass-surface sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-indigo">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">
                  SlideArchitect AI
                </h1>
                <p className="text-xs text-slate-400">
                  Créez des présentations intelligentes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400 hover:text-slate-100 hover:bg-white/5">
                  Recommencer
                </Button>
              )}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: "Template PDF" },
            { num: 2, label: "Votre contenu" },
            { num: 3, label: "Plan de slides" },
          ].map((step, idx) => (
            <React.Fragment key={step.num}>
              <div
                className={`flex items-center gap-2 ${currentStep >= step.num
                  ? "text-indigo-400"
                  : "text-slate-500"
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${currentStep > step.num
                    ? "bg-indigo-500 text-white glow-indigo"
                    : currentStep === step.num
                      ? "bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500"
                      : "bg-slate-800 text-slate-500"
                    }`}
                >
                  {currentStep > step.num ? "✓" : step.num}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {step.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`w-12 h-0.5 ${currentStep > step.num ? "bg-indigo-500" : "bg-slate-700"
                    }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Contenu principal */}
        <main className="max-w-4xl mx-auto">
          {/* Étape 1: Upload PDF */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-100">
                  Importez votre template
                </h2>
                <p className="text-slate-400">
                  Choisissez un PDF de présentation dont vous aimez le style
                </p>
              </div>

              <PDFUploader onExtracted={handlePdfExtracted} />

              <Card className="glass-surface">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-400">
                    💡 <strong className="text-slate-200">Conseil :</strong> Utilisez un template Canva ou
                    PowerPoint que vous aimez. L&apos;IA analysera son style visuel
                    pour vous guider.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Étape 2: Contenu texte */}
          {currentStep === 2 && pdfResult && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-100">
                  Ajoutez votre contenu
                </h2>
                <p className="text-slate-400">
                  Le texte brut que vous voulez transformer en présentation
                </p>
              </div>

              {/* Aperçu PDF compact */}
              <Card className="glass-surface">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-slate-100">{pdfResult.file_name}</p>
                      <p className="text-sm text-slate-400">
                        {selectedPageIndices.length} pages sélectionnées
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleBack} className="border-white/10 text-slate-300 hover:bg-white/5">
                      Changer
                    </Button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {pdfResult.images.slice(0, 5).map((img, idx) => (
                      <img
                        key={idx}
                        src={img.base64_data}
                        alt={`Page ${idx + 1}`}
                        className="h-20 w-auto rounded border border-white/10"
                      />
                    ))}
                    {pdfResult.images.length > 5 && (
                      <div className="h-20 w-16 rounded border border-white/10 bg-slate-800 flex items-center justify-center text-sm text-slate-400">
                        +{pdfResult.images.length - 5}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Zone de texte */}
              <TextInput
                value={userContent}
                onChange={setUserContent}
              />

              {/* Bouton d'analyse */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleBack} className="border-white/10 text-slate-300 hover:bg-white/5">
                  Retour
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || isAnalyzing}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white glow-indigo"
                >
                  {isAnalyzing ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Analyse en cours...
                    </>
                  ) : (
                    "Générer le plan de slides"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Étape 3: Résultats */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* En cours d'analyse */}
              {isAnalyzing && (
                <Card className="p-8 glass-surface">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center glow-indigo">
                      <svg
                        className="w-8 h-8 text-indigo-400 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-slate-100">
                        L&apos;IA analyse votre template...
                      </h3>
                      <p className="text-slate-400">
                        {analysisMessage || "Cela peut prendre quelques secondes"}
                      </p>
                    </div>
                    <Progress value={analysisProgress} className="max-w-xs mx-auto" />
                  </div>
                </Card>
              )}

              {/* Erreur */}
              {analysisStatus === "error" && error && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={handleBack}>
                      Retour
                    </Button>
                    <Button onClick={handleAnalyze}>Réessayer</Button>
                  </div>
                </div>
              )}

              {/* Succès - Afficher le plan */}
              {analysisStatus === "success" && presentationPlan && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-100">
                      Votre plan de présentation
                    </h2>
                    <p className="text-slate-400">
                      Suivez ces instructions pour créer vos slides
                    </p>
                  </div>

                  <SlidePlan
                    plan={presentationPlan}
                    templateImages={selectedPageIndices.map(
                      (idx) => pdfResult?.images[idx]?.base64_data
                    ).filter((img): img is string => !!img)}
                  />

                  <div className="flex justify-center gap-3 pt-4">
                    <Button variant="outline" onClick={handleBack}>
                      Modifier le contenu
                    </Button>
                    <Button onClick={handleReset}>
                      Nouvelle présentation
                    </Button>
                  </div>
                </div>
              )}

              {/* État en attente (placeholder pour la Phase 4) */}
              {analysisStatus === "idle" && (
                <Card className="p-8">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      L&apos;intégration avec Claude AI sera ajoutée dans la Phase 4.
                    </p>
                    <Button onClick={handleBack}>Retour</Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          SlideArchitect AI - Propulsé par Claude 3.5 Sonnet
        </div>
      </footer>
    </div>
  );
}
