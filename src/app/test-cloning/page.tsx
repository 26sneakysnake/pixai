/**
 * Test Page for Template Cloning Feature
 * Route: /test-cloning
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";
import { PPTXUploader } from "@/components/pptx";
import { CloningPlan } from "@/components/results";
import type { CloningInstructions } from "@/lib/pptx/types";

export default function TestCloningPage() {
    const [pptxBase64, setPptxBase64] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [userContent, setUserContent] = useState<string>(
        `# Ma Présentation Test

## Introduction
Bienvenue dans cette présentation de démonstration.

## Points Clés
- Premier point important à aborder
- Deuxième aspect du sujet
- Troisième élément à retenir

## Conclusion
Merci pour votre attention !`
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CloningInstructions | null>(null);
    const [templateInfo, setTemplateInfo] = useState<string | null>(null);

    const handleFileSelected = (base64: string, name: string) => {
        setPptxBase64(base64);
        setFileName(name);
        setError(null);
    };

    const handleTest = async () => {
        if (!pptxBase64 || !userContent.trim()) {
            setError("Veuillez uploader un fichier PPTX et entrer du contenu texte");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const { generateCloningPlan } = await import("@/lib/ai");

            const response = await generateCloningPlan({
                pptxBase64,
                userContent: userContent.trim(),
            });

            if (response.success && response.instructions) {
                setResult(response.instructions);
                setTemplateInfo(response.templateSummary || null);
            } else if (response.error) {
                setError(`${response.error.message} - ${response.error.details || ""}`);
            }
        } catch (err) {
            setError(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!pptxBase64 || !result) return;

        setIsGenerating(true);
        setError(null);

        try {
            const { generatePptxFile } = await import("@/lib/ai");

            const response = await generatePptxFile({
                pptxBase64,
                instructions: result,
            });

            if (response.success && response.fileBase64 && response.fileName) {
                // Trigger download
                const link = document.createElement("a");
                link.href = response.fileBase64;
                link.download = response.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (response.error) {
                setError(`Erreur génération: ${response.error}`);
            }
        } catch (err) {
            setError(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        🧪 Test: Template Cloning
                    </h1>
                    <p className="text-muted-foreground">
                        Testez le parsing PPTX et la génération d'instructions de clonage
                    </p>
                </div>

                {/* Test Form - Only show if no result */}
                {!result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: PPTX Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span>1️⃣</span> Upload PPTX Template
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PPTXUploader onFileSelected={handleFileSelected} />
                                {fileName && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>{fileName} sélectionné</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Right: Content Input */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span>2️⃣</span> Contenu Texte
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={userContent}
                                    onChange={(e) => setUserContent(e.target.value)}
                                    placeholder="Entrez votre contenu..."
                                    className="min-h-[250px] font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {userContent.length} caractères
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Action Button */}
                {!result && (
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={handleTest}
                            disabled={isLoading || !pptxBase64}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Analyse en cours...
                                </>
                            ) : (
                                "🚀 Lancer le Test"
                            )}
                        </Button>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Template Info */}
                {templateInfo && (
                    <Alert className="bg-emerald-50 border-emerald-200">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <AlertDescription className="text-emerald-800">
                            {templateInfo}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-xl font-semibold text-emerald-800">
                                ✅ Instructions de Clonage Générées
                            </h2>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleDownload}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Génération...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Télécharger PPTX
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => setResult(null)}>
                                    Nouveau Test
                                </Button>
                            </div>
                        </div>
                        <CloningPlan instructions={result} />
                    </div>
                )}
            </div>
        </div>
    );
}

