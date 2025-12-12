/**
 * Slide Plan Display Component (Workspace Mode)
 * Premium Dark SaaS aesthetic - Clean and focused
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layers,
    Copy,
    Check,
    LayoutTemplate,
    ChevronRight,
    ChevronLeft,
    Lightbulb,
    Type,
    Target,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PresentationPlan } from "@/types";

interface SlidePlanProps {
    plan: PresentationPlan;
    templateImages?: string[];
    className?: string;
}

export function SlidePlan({ plan, templateImages, className }: SlidePlanProps) {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [copied, setCopied] = useState<string | null>(null);
    const activeSlide = plan.slides[activeSlideIndex];

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const goToSlide = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && activeSlideIndex > 0) {
            setActiveSlideIndex(activeSlideIndex - 1);
        } else if (direction === 'next' && activeSlideIndex < plan.slides.length - 1) {
            setActiveSlideIndex(activeSlideIndex + 1);
        }
    };

    return (
        <div className={cn("w-full", className)}>
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-sm px-3 py-1">
                        Slide {activeSlide.slide_number} / {plan.total_slides}
                    </Badge>
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4" />
                        {activeSlide.layout_type.replace(/_/g, " ")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => goToSlide('prev')}
                        disabled={activeSlideIndex === 0}
                        className="text-slate-400 hover:text-slate-100"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => goToSlide('next')}
                        disabled={activeSlideIndex === plan.slides.length - 1}
                        className="text-slate-400 hover:text-slate-100"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Slide Thumbnails - Left Column */}
                <div className="lg:col-span-2">
                    <div className="glass-surface rounded-xl p-3">
                        <ScrollArea className="h-[500px]">
                            <div className="space-y-2">
                                {plan.slides.map((slide, index) => (
                                    <button
                                        key={slide.slide_number}
                                        onClick={() => setActiveSlideIndex(index)}
                                        className={cn(
                                            "w-full text-left p-2 rounded-lg transition-all duration-200",
                                            index === activeSlideIndex
                                                ? "bg-indigo-500/20 ring-1 ring-indigo-500/50"
                                                : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center",
                                                index === activeSlideIndex
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-slate-700 text-slate-400"
                                            )}>
                                                {slide.slide_number}
                                            </span>
                                            <span className={cn(
                                                "text-xs truncate",
                                                index === activeSlideIndex
                                                    ? "text-indigo-300"
                                                    : "text-slate-400"
                                            )}>
                                                {slide.content_to_use.title?.slice(0, 20) || "Sans titre"}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* Preview - Center Column */}
                <div className="lg:col-span-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSlideIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="glass-surface rounded-xl overflow-hidden"
                        >
                            {/* Template Image */}
                            <div className="aspect-[16/9] bg-slate-800 relative">
                                {templateImages?.[activeSlide.reference_image_index] ? (
                                    <img
                                        src={templateImages[activeSlide.reference_image_index]}
                                        alt={`Template slide ${activeSlide.reference_image_index + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Layers className="w-12 h-12 text-slate-600" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-black/60 text-white backdrop-blur-sm">
                                        Réf: #{activeSlide.reference_image_index + 1}
                                    </Badge>
                                </div>
                            </div>

                            {/* Typography Info - Compact */}
                            {activeSlide.font_suggestions && (
                                <div className="p-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Type className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs font-medium text-slate-400 uppercase">Typographie</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-xs bg-slate-800 border-slate-600 text-slate-300">
                                            {activeSlide.font_suggestions.primary || "Default"}
                                        </Badge>
                                        {activeSlide.font_suggestions.sizes && (
                                            <Badge variant="outline" className="text-xs bg-slate-800 border-slate-600 text-slate-300">
                                                {activeSlide.font_suggestions.sizes}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Content - Right Column */}
                <div className="lg:col-span-5">
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="glass-surface rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-400 uppercase flex items-center gap-2">
                                    <Target className="w-3 h-3" /> Titre
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-indigo-400"
                                    onClick={() => handleCopy(activeSlide.content_to_use.title || "", "title")}
                                >
                                    {copied === "title" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </Button>
                            </div>
                            <p className="text-lg font-semibold text-slate-100">
                                {activeSlide.content_to_use.title || "Sans titre"}
                            </p>
                        </div>

                        {/* Modifications - Compact List */}
                        {activeSlide.content_to_use.modifications && activeSlide.content_to_use.modifications.length > 0 && (
                            <div className="glass-surface rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-medium text-amber-400 uppercase">Modifications</span>
                                </div>
                                <div className="space-y-2">
                                    {activeSlide.content_to_use.modifications.map((mod, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5"
                                        >
                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-slate-500">{mod.target_element}</span>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-700 border-slate-600 text-slate-300">
                                                        {mod.action}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-200 break-words">{mod.value}</p>
                                                {mod.style_details && (
                                                    <p className="text-xs text-slate-500 mt-1 italic">{mod.style_details}</p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-slate-400 hover:text-indigo-400 shrink-0"
                                                onClick={() => handleCopy(mod.value, `mod-${idx}`)}
                                            >
                                                {copied === `mod-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Body Content */}
                        {activeSlide.content_to_use.body && activeSlide.content_to_use.body.length > 0 && (
                            <div className="glass-surface rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-slate-400 uppercase">Corps du texte</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-slate-400 hover:text-indigo-400"
                                        onClick={() => handleCopy(activeSlide.content_to_use.body.join("\n"), "body")}
                                    >
                                        {copied === "body" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </Button>
                                </div>
                                <ul className="space-y-1.5">
                                    {activeSlide.content_to_use.body.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Visual Notes */}
                        {activeSlide.content_to_use.visual_notes && (
                            <div className="flex items-start gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-indigo-200 italic">{activeSlide.content_to_use.visual_notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Style Notes */}
            {plan.style_notes && (
                <div className="mt-6 p-4 glass-surface rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium text-slate-300">Notes de style globales</span>
                    </div>
                    <p className="text-sm text-slate-400 italic">{plan.style_notes}</p>
                </div>
            )}
        </div>
    );
}
