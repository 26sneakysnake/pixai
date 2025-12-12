/**
 * PPTX Uploader Component
 * Upload and parse PowerPoint files for Template Cloning
 */

"use client";

import React, { useCallback, useState } from "react";
import { Upload, FileIcon, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PPTXUploaderProps {
    onFileSelected: (base64: string, fileName: string) => void;
    className?: string;
}

export function PPTXUploader({ onFileSelected, className }: PPTXUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback(async (file: File) => {
        if (!file.name.endsWith('.pptx')) {
            setError("Veuillez sélectionner un fichier .pptx valide");
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            setError("Le fichier est trop volumineux (max 50 MB)");
            return;
        }

        setError(null);
        setIsProcessing(true);
        setFileName(file.name);

        try {
            // Convert to Base64
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const dataUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64}`;

            onFileSelected(dataUrl, file.name);
        } catch (err) {
            setError("Erreur lors de la lecture du fichier");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    }, [onFileSelected]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-0">
                <label
                    className={cn(
                        "relative flex flex-col items-center justify-center min-h-[300px] cursor-pointer",
                        "border-2 border-dashed transition-all duration-200",
                        isDragging
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-muted-foreground/25 hover:border-emerald-400 hover:bg-emerald-50/30"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        accept=".pptx"
                        className="sr-only"
                        onChange={handleInputChange}
                        disabled={isProcessing}
                    />

                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                            <p className="text-muted-foreground">
                                Lecture du fichier...
                            </p>
                        </div>
                    ) : fileName ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-emerald-100 rounded-full">
                                <Check className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-emerald-700">{fileName}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Fichier prêt
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 p-8">
                            <div className="p-4 bg-emerald-100 rounded-full">
                                <Upload className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">
                                    Glissez votre fichier PPTX ici
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    ou cliquez pour parcourir
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <FileIcon className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs text-muted-foreground">
                                    Formats: .pptx (max 50 MB)
                                </span>
                            </div>
                        </div>
                    )}
                </label>

                {error && (
                    <Alert variant="destructive" className="m-4 mt-0">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
