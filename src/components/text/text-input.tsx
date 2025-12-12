/**
 * Text Input Component
 * Zone de saisie pour le contenu texte de l'utilisateur
 */

"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TextInputProps {
    /** Valeur initiale */
    value?: string;
    /** Callback quand le texte change */
    onChange?: (text: string) => void;
    /** Placeholder personnalisé */
    placeholder?: string;
    /** Classe CSS additionnelle */
    className?: string;
    /** Désactiver l'édition */
    disabled?: boolean;
}

// Exemple de contenu pour guider l'utilisateur
const EXAMPLE_CONTENT = `# Introduction à notre entreprise

Notre mission est de révolutionner le secteur technologique.

## Nos valeurs
- Innovation continue
- Excellence opérationnelle
- Orientation client

## Nos services
1. Conseil stratégique
2. Développement logiciel
3. Formation et accompagnement

## Contact
Contactez-nous pour en savoir plus.`;

export function TextInput({
    value = "",
    onChange,
    placeholder = "Collez ou saisissez votre contenu texte ici...",
    className,
    disabled = false,
}: TextInputProps) {
    const [text, setText] = useState(value);
    const [charCount, setCharCount] = useState(value.length);

    // Limite de caractères recommandée
    const MAX_CHARS = 10000;
    const isNearLimit = charCount > MAX_CHARS * 0.8;
    const isOverLimit = charCount > MAX_CHARS;

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newText = e.target.value;
            setText(newText);
            setCharCount(newText.length);
            onChange?.(newText);
        },
        [onChange]
    );

    const handleClear = useCallback(() => {
        setText("");
        setCharCount(0);
        onChange?.("");
    }, [onChange]);

    const handleLoadExample = useCallback(() => {
        setText(EXAMPLE_CONTENT);
        setCharCount(EXAMPLE_CONTENT.length);
        onChange?.(EXAMPLE_CONTENT);
    }, [onChange]);

    return (
        <Card className={cn("w-full glass-surface", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg text-slate-100">Votre contenu</CardTitle>
                        <CardDescription className="text-slate-400">
                            Le texte brut que vous souhaitez transformer en présentation
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLoadExample}
                            disabled={disabled}
                            className="text-slate-400 hover:text-slate-100 hover:bg-white/5"
                        >
                            Exemple
                        </Button>
                        {text.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                disabled={disabled}
                                className="text-slate-400 hover:text-slate-100 hover:bg-white/5"
                            >
                                Effacer
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <Textarea
                    value={text}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "min-h-[200px] resize-y font-mono text-sm",
                        "bg-slate-900/50 border-slate-700",
                        "text-slate-100 placeholder:text-slate-500",
                        "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500",
                        isOverLimit && "border-red-500 focus:ring-red-500/50"
                    )}
                />

                {/* Compteur de caractères */}
                <div className="flex items-center justify-between text-sm">
                    <div className="text-slate-500">
                        {text.length > 0 && (
                            <span>
                                ~{Math.ceil(text.split(/\s+/).filter(Boolean).length / 150)} min de lecture
                            </span>
                        )}
                    </div>
                    <div
                        className={cn(
                            "font-mono text-slate-500",
                            isOverLimit && "text-red-400 font-semibold",
                            isNearLimit && !isOverLimit && "text-amber-400"
                        )}
                    >
                        {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                    </div>
                </div>

                {/* Alerte si dépassement */}
                {isOverLimit && (
                    <p className="text-sm text-red-500">
                        Le texte est trop long. Réduisez-le pour de meilleurs résultats.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
