/**
 * Cloning Plan Display Component
 * Displays AI-generated template cloning instructions
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Copy,
    Check,
    Layers,
    FileText,
    Palette,
    Type,
    ChevronRight,
    ClipboardCopy,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CloningInstructions } from "@/lib/pptx/types";

interface CloningPlanProps {
    instructions: CloningInstructions;
    className?: string;
}

export function CloningPlan({ instructions, className }: CloningPlanProps) {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const activeSlide = instructions.slides[activeSlideIndex];

    return (
        <div className={cn("flex h-[calc(100vh-140px)] min-h-[600px] w-full bg-slate-50 border rounded-xl overflow-hidden shadow-sm", className)}>
            {/* --- Left Sidebar: Slide List --- */}
            <div className="w-72 border-r bg-white flex flex-col h-full z-10 shrink-0">
                <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Template Cloning
                        </Badge>
                    </div>
                    <h2 className="font-semibold text-slate-800">
                        {instructions.structure.total_slides} Slides à Créer
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {instructions.structure.story_flow}
                    </p>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {instructions.slides.map((slide, index) => (
                            <button
                                key={slide.slide_number}
                                onClick={() => setActiveSlideIndex(index)}
                                className={cn(
                                    "w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200 flex items-start gap-3 group",
                                    index === activeSlideIndex
                                        ? "bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-200"
                                        : "hover:bg-slate-100 text-slate-600"
                                )}
                            >
                                <span className={cn(
                                    "shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold mt-0.5",
                                    index === activeSlideIndex ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-500"
                                )}>
                                    {slide.slide_number}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate leading-tight">
                                        {slide.title || "Sans titre"}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-slate-50">
                                            Clone #{slide.template_slide_reference.index}
                                        </Badge>
                                    </div>
                                </div>
                                {index === activeSlideIndex && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-emerald-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>

                {/* Color Palette Footer */}
                <div className="p-3 border-t bg-slate-50">
                    <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                        <Palette className="w-3 h-3" /> Palette du Template
                    </div>
                    <div className="flex gap-1">
                        {Object.entries(instructions.color_palette).map(([key, color]) => (
                            <div
                                key={key}
                                className="w-6 h-6 rounded-md border border-slate-200 shadow-sm"
                                style={{ backgroundColor: color }}
                                title={`${key}: ${color}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Main Area: Slide Details --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                {/* Header */}
                <header className="h-14 border-b bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                            Slide {activeSlide.slide_number}
                        </Badge>
                        <div className="h-4 w-px bg-slate-200 mx-1" />
                        <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <span>Clone Template Slide #{activeSlide.template_slide_reference.index}</span>
                        </span>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Clone Reference Card */}
                        <motion.div
                            key={`ref-${activeSlideIndex}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                                        Cloner la Slide #{activeSlide.template_slide_reference.index} du Template
                                    </h3>
                                    <p className="text-sm text-emerald-700/80">
                                        {activeSlide.template_slide_reference.reason}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Content Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Title */}
                            <ContentCard
                                label="Titre"
                                content={activeSlide.title}
                                icon={<Type className="w-4 h-4" />}
                            />

                            {/* Content */}
                            <ContentCard
                                label="Contenu"
                                content={activeSlide.content}
                                icon={<FileText className="w-4 h-4" />}
                                multiline
                            />
                        </div>

                        {/* Design Specs */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="overflow-hidden border-slate-200">
                                <div className="bg-slate-50 px-4 py-2 border-b flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Spécifications Design
                                    </span>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Background */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg border shadow-sm"
                                            style={{ backgroundColor: activeSlide.design.background_color }}
                                        />
                                        <div>
                                            <p className="text-xs text-slate-500">Fond</p>
                                            <p className="text-sm font-mono font-medium">{activeSlide.design.background_color}</p>
                                        </div>
                                    </div>

                                    {/* Title Font */}
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Police Titre</p>
                                        <p className="text-sm font-medium">{activeSlide.design.title_font.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {activeSlide.design.title_font.size}px • {activeSlide.design.title_font.weight || 'normal'}
                                        </p>
                                    </div>

                                    {/* Body Font */}
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Police Corps</p>
                                        <p className="text-sm font-medium">{activeSlide.design.body_font.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {activeSlide.design.body_font.size}px
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Subcomponent: Content Card with Copy ---

function ContentCard({
    label,
    content,
    icon,
    multiline = false
}: {
    label: string;
    content: string;
    icon: React.ReactNode;
    multiline?: boolean;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-slate-50 px-4 py-2 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">{icon}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {label}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-emerald-600"
                    onClick={handleCopy}
                    title="Copier"
                >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
            </div>
            <div className={cn(
                "p-4 bg-white",
                multiline ? "min-h-[120px]" : ""
            )}>
                <p className={cn(
                    "text-slate-800",
                    multiline ? "text-sm leading-relaxed whitespace-pre-wrap" : "text-base font-medium"
                )}>
                    {content || <span className="italic text-slate-400">Aucun contenu</span>}
                </p>
            </div>
        </Card>
    );
}
