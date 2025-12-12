/**
 * PDF Uploader Component
 * Zone de drop pour upload de fichiers PDF avec prévisualisation
 */

"use client";

import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePDFProcessor } from "@/hooks/use-pdf-processor";
import { isPDFFile, formatFileSize, getErrorMessage } from "@/lib/pdf";
import type { PDFExtractionResult } from "@/types";

interface PDFUploaderProps {
    /** Callback appelé quand l'extraction est terminée */
    onExtracted?: (result: PDFExtractionResult) => void;
    /** Classe CSS additionnelle */
    className?: string;
}

export function PDFUploader({ onExtracted, className }: PDFUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { status, progress, progressMessage, result, error, processFile, reset } =
        usePDFProcessor();

    // Gérer la sélection de fichier
    const handleFileSelect = useCallback(
        async (file: File) => {
            if (!isPDFFile(file)) {
                alert("Veuillez sélectionner un fichier PDF valide.");
                return;
            }

            setSelectedFile(file);
            await processFile(file);
        },
        [processFile]
    );

    // Quand l'extraction réussit, notifier le parent
    React.useEffect(() => {
        if (status === "success" && result && onExtracted) {
            onExtracted(result);
        }
    }, [status, result, onExtracted]);

    // Event handlers pour le drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        },
        [handleFileSelect]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleFileSelect(files[0]);
            }
        },
        [handleFileSelect]
    );

    const handleReset = useCallback(() => {
        setSelectedFile(null);
        reset();
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }, [reset]);

    const isProcessing = status === "extracting" || status === "uploading";
    const isComplete = status === "success";
    const hasError = status === "error";

    return (
        <div className={cn("w-full", className)}>
            <Card
                className={cn(
                    "relative border-2 border-dashed transition-all duration-300",
                    "p-12 text-center cursor-pointer",
                    "bg-slate-900/30 backdrop-blur-sm",
                    isDragging && "border-indigo-500 bg-indigo-500/10 scale-[1.02] glow-indigo",
                    isComplete && "border-emerald-500 bg-emerald-500/10",
                    hasError && "border-red-500 bg-red-500/10",
                    !isDragging && !isComplete && !hasError && "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isProcessing && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={isProcessing}
                />

                {/* État initial - Upload */}
                {status === "idle" && (
                    <div className="space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-indigo-400 animate-pulse"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-slate-100">
                                Glissez votre PDF modèle ici
                            </p>
                            <p className="text-sm text-slate-400 mt-2">
                                ou cliquez pour parcourir (max 50 MB)
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-4 pt-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                PDF
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                Canva
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                                PowerPoint
                            </div>
                        </div>
                    </div>
                )}

                {/* État de traitement */}
                {isProcessing && (
                    <div className="space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-indigo-400 animate-spin"
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-slate-100">{progressMessage}</p>
                            {selectedFile && (
                                <p className="text-sm text-slate-400 mt-1">
                                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                </p>
                            )}
                        </div>
                        <Progress value={progress} className="w-full max-w-xs mx-auto" />
                    </div>
                )}

                {/* État succès */}
                {isComplete && result && (
                    <div className="space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-emerald-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-emerald-400">
                                PDF analysé avec succès !
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                {result.images.length} page(s) sur {result.total_pages} extraite(s)
                            </p>
                        </div>
                    </div>
                )}

                {/* État erreur */}
                {hasError && error && (
                    <div className="space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-red-400">
                                Erreur lors du traitement
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Message d'erreur détaillé */}
            {hasError && error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{getErrorMessage(error.code)}</AlertDescription>
                </Alert>
            )}

            {/* Boutons d'action */}
            {(isComplete || hasError) && (
                <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={handleReset} className="border-white/10 text-slate-300 hover:bg-white/5">
                        Choisir un autre fichier
                    </Button>
                </div>
            )}
        </div>
    );
}
