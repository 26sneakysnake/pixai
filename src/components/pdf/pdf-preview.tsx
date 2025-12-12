/**
 * PDF Preview Component
 * Affiche les pages PDF extraites sous forme de grille de miniatures
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PDFExtractionResult, PDFPageImage } from "@/types";

interface PDFPreviewProps {
    /** Résultat de l'extraction PDF */
    result: PDFExtractionResult;
    /** Pages sélectionnées (indices) */
    selectedPages?: number[];
    /** Callback quand la sélection change */
    onSelectionChange?: (indices: number[]) => void;
    /** Permet la sélection multiple */
    multiSelect?: boolean;
    /** Classe CSS additionnelle */
    className?: string;
}

export function PDFPreview({
    result,
    selectedPages = [],
    onSelectionChange,
    multiSelect = true,
    className,
}: PDFPreviewProps) {
    const [expandedImage, setExpandedImage] = useState<PDFPageImage | null>(null);

    // Gérer le clic sur une miniature
    const handlePageClick = (index: number) => {
        if (!onSelectionChange) return;

        if (multiSelect) {
            // Toggle la sélection
            const newSelection = selectedPages.includes(index)
                ? selectedPages.filter((i) => i !== index)
                : [...selectedPages, index];
            onSelectionChange(newSelection);
        } else {
            // Sélection unique
            onSelectionChange([index]);
        }
    };

    // Sélectionner toutes les pages
    const selectAll = () => {
        onSelectionChange?.(result.images.map((_, i) => i));
    };

    // Désélectionner toutes les pages
    const deselectAll = () => {
        onSelectionChange?.([]);
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header avec infos et actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">{result.file_name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {result.images.length} page(s) sur {result.total_pages}
                        {selectedPages.length > 0 && (
                            <span className="ml-2 text-primary">
                                • {selectedPages.length} sélectionnée(s)
                            </span>
                        )}
                    </p>
                </div>

                {onSelectionChange && multiSelect && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAll}>
                            Tout sélectionner
                        </Button>
                        <Button variant="ghost" size="sm" onClick={deselectAll}>
                            Désélectionner
                        </Button>
                    </div>
                )}
            </div>

            {/* Grille de miniatures */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {result.images.map((image, index) => {
                    const isSelected = selectedPages.includes(index);

                    return (
                        <Card
                            key={image.page_index}
                            className={cn(
                                "relative overflow-hidden cursor-pointer transition-all duration-200",
                                "hover:ring-2 hover:ring-primary/50",
                                isSelected && "ring-2 ring-primary shadow-lg",
                                onSelectionChange && "hover:scale-[1.02]"
                            )}
                            onClick={() => handlePageClick(index)}
                        >
                            {/* Indicateur de sélection */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-primary-foreground"
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
                            )}

                            {/* Image de la page */}
                            <div className="relative aspect-[3/4] bg-muted">
                                <Image
                                    src={image.base64_data}
                                    alt={`Page ${image.page_index + 1}`}
                                    fill
                                    className="object-contain"
                                    unoptimized // Nécessaire pour les images Base64
                                />
                            </div>

                            {/* Numéro de page */}
                            <div className="p-2 text-center text-sm font-medium bg-muted/50">
                                Page {image.page_index + 1}
                            </div>

                            {/* Bouton zoom */}
                            <button
                                className="absolute top-2 left-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedImage(image);
                                }}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                    />
                                </svg>
                            </button>
                        </Card>
                    );
                })}
            </div>

            {/* Modal d'image agrandie */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <Image
                            src={expandedImage.base64_data}
                            alt={`Page ${expandedImage.page_index + 1}`}
                            width={expandedImage.width}
                            height={expandedImage.height}
                            className="object-contain max-h-[90vh]"
                            unoptimized
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-4 right-4"
                            onClick={() => setExpandedImage(null)}
                        >
                            Fermer
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
