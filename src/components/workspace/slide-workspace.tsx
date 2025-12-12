/**
 * SlideWorkspace.tsx
 * A sophisticated interface for reviewing and editing slide generation plans.
 * Combines Annotated Reference (Pins) with Live Wireframe Preview.
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layers,
    Eye,
    Copy,
    Check,
    LayoutTemplate,
    Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Mock Data Structure ---
// In a real app, this would be passed as props or fetched
const mockSlideData = {
    id: 1,
    type: "split_image_left", // layout logic
    original_image_url: "https://placehold.co/600x400/e2e8f0/475569?text=Slide+Template", // Placeholder
    styles: {
        background: "#F5F5DC", // Beige
        font_main: "Playfair Display",
        font_secondary: "Lato",
        accent_color: "#2C3E50"
    },
    elements: [
        {
            id: "el_1",
            type: "title",
            label: "Titre Principal",
            content: "LE JARDINAGE URBAIN",
            position_hint: { top: 10, left: 5 }, // % coordinates for the Pin
            style_preview: "text-4xl font-bold uppercase tracking-widest text-[#2C3E50] font-serif", // Tailwind equivalents
            instruction: "Placer en haut à gauche, police Playfair Display"
        },
        {
            id: "el_2",
            type: "image",
            label: "Visuel",
            content: "Image de plantes sur un balcon",
            position_hint: { top: 20, left: 60 },
            style_preview: "rounded-full aspect-square object-cover shadow-xl bg-green-100 w-full h-full flex items-center justify-center text-green-800",
            instruction: "Utiliser une image ronde à droite"
        },
        {
            id: "el_3",
            type: "body",
            label: "Liste",
            content: ["Écologie", "Santé", "Économie"],
            position_hint: { top: 50, left: 5 },
            style_preview: "space-y-4 text-lg text-gray-700 italic",
            instruction: "Liste à puces minimaliste"
        }
    ]
};

export function SlideWorkspace() {
    const [activeElementId, setActiveElementId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"reference" | "preview">("reference");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Handle copying content to clipboard
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] w-full bg-slate-50 border rounded-xl overflow-hidden shadow-sm">
            {/* --- Left Panel: Visualizer (2/3 width) --- */}
            <div className="w-2/3 border-r bg-slate-100/50 flex flex-col relative">
                <Tabs
                    defaultValue="reference"
                    value={viewMode}
                    onValueChange={(v) => setViewMode(v as "reference" | "preview")}
                    className="w-full flex-1 flex flex-col"
                >
                    {/* Header Toggle */}
                    <div className="px-6 py-3 border-b bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Slide {mockSlideData.id}
                            </Badge>
                            <span className="text-sm text-slate-500 font-medium capitalize">
                                {mockSlideData.type.replace(/_/g, " ")} Layout
                            </span>
                        </div>

                        <TabsList className="grid w-[300px] grid-cols-2">
                            <TabsTrigger value="reference" className="flex gap-2">
                                <Layers className="w-4 h-4" /> Reference
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="flex gap-2">
                                <LayoutTemplate className="w-4 h-4" /> Live Preview
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            {/* VIEW: REFERENCE PDF */}
                            <TabsContent value="reference" className="w-full h-full m-0 flex items-center justify-center focus-visible:ring-0">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative max-w-4xl w-full aspect-[16/9] shadow-2xl rounded-lg overflow-hidden group bg-white"
                                >
                                    <img
                                        src={mockSlideData.original_image_url}
                                        alt="Slide Template Reference"
                                        className="w-full h-full object-cover opacity-90"
                                    />

                                    {/* Overlay Pins */}
                                    {mockSlideData.elements.map((el, index) => (
                                        <motion.div
                                            key={el.id}
                                            className={cn(
                                                "absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg cursor-pointer transition-all duration-200 z-10 border-2",
                                                activeElementId === el.id
                                                    ? "bg-blue-600 text-white scale-125 border-white ring-4 ring-blue-600/20"
                                                    : "bg-white/90 text-slate-700 border-slate-200 hover:bg-blue-100"
                                            )}
                                            style={{
                                                top: `${el.position_hint.top}%`,
                                                left: `${el.position_hint.left}%`
                                            }}
                                            onMouseEnter={() => setActiveElementId(el.id)}
                                            onMouseLeave={() => setActiveElementId(null)}
                                            whileHover={{ scale: 1.1 }}
                                            animate={{
                                                scale: activeElementId === el.id ? 1.25 : 1
                                            }}
                                        >
                                            {index + 1}
                                        </motion.div>
                                    ))}

                                    {/* Grid Overlay Hint */}
                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                </motion.div>
                            </TabsContent>

                            {/* VIEW: LIVE PREVIEW WIREFRAME */}
                            <TabsContent value="preview" className="w-full h-full m-0 flex items-center justify-center focus-visible:ring-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="relative max-w-4xl w-full aspect-[16/9] shadow-2xl rounded-lg overflow-hidden bg-white p-12 transition-colors duration-500"
                                    style={{ backgroundColor: mockSlideData.styles.background }}
                                >
                                    {/* Dynamic Element Rendering */}
                                    {mockSlideData.elements.map((el) => {
                                        const isHovered = activeElementId === el.id;

                                        return (
                                            <div
                                                key={el.id}
                                                className={cn(
                                                    "absolute transition-all duration-300 border-2 border-transparent",
                                                    isHovered && "border-blue-400/50 bg-blue-50/10 rounded-lg p-1"
                                                )}
                                                style={{
                                                    top: `${el.position_hint.top}%`,
                                                    left: `${el.position_hint.left}%`,
                                                    width: el.type === 'image' ? '30%' : (el.type === 'body' ? '45%' : 'auto'),
                                                }}
                                                onMouseEnter={() => setActiveElementId(el.id)}
                                                onMouseLeave={() => setActiveElementId(null)}
                                            >
                                                {el.type === 'image' ? (
                                                    <div className={cn(el.style_preview, "flex flex-col items-center justify-center text-center p-4 bg-slate-200/50")}>
                                                        <Eye className="w-8 h-8 mb-2 opacity-50" />
                                                        <span className="text-xs font-mono">{el.content}</span>
                                                    </div>
                                                ) : Array.isArray(el.content) ? (
                                                    <ul className={el.style_preview}>
                                                        {el.content.map((item, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <h2 className={el.style_preview}>{el.content}</h2>
                                                )}
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </div>
                </Tabs>
            </div>

            {/* --- Right Panel: Action List (1/3 width) --- */}
            <div className="w-1/3 bg-white flex flex-col h-full border-l">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        Visual Recipe
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Instructions & content extracted from AI analysis
                    </p>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {mockSlideData.elements.map((el, index) => {
                            const isActive = activeElementId === el.id;

                            return (
                                <motion.div
                                    key={el.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card
                                        className={cn(
                                            "group relative overflow-hidden transition-all duration-300 border-l-4",
                                            isActive
                                                ? "border-l-blue-600 shadow-md ring-1 ring-blue-100"
                                                : "border-l-transparent hover:border-l-slate-300 hover:shadow-sm"
                                        )}
                                        onMouseEnter={() => setActiveElementId(el.id)}
                                        onMouseLeave={() => setActiveElementId(null)}
                                    >
                                        <div className="p-4 space-y-3">
                                            {/* Header with Badge & Type */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                                                        isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                                                    )}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                        {el.label}
                                                    </span>
                                                </div>
                                                {isActive && (
                                                    <Badge variant="secondary" className="text-[10px] h-5">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Content Preview */}
                                            <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className={cn(
                                                        "text-sm",
                                                        el.type === 'title' ? "font-serif font-bold text-slate-800" : "text-slate-600"
                                                    )}>
                                                        {Array.isArray(el.content) ? (
                                                            <ul className="list-disc pl-4 space-y-1">
                                                                {el.content.map((item, i) => <li key={i}>{item}</li>)}
                                                            </ul>
                                                        ) : (
                                                            el.content
                                                        )}
                                                    </div>

                                                    {/* Copy Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 shrink-0 text-slate-400 hover:text-blue-600"
                                                        onClick={() => handleCopy(
                                                            Array.isArray(el.content) ? el.content.join("\n") : el.content,
                                                            el.id
                                                        )}
                                                    >
                                                        {copiedId === el.id ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Visual Instruction (Recipe) */}
                                            <div className="flex items-start gap-2 text-xs text-slate-500 bg-blue-50/50 p-2 rounded border border-blue-50">
                                                <Maximize2 className="w-3 h-3 mt-0.5 text-blue-400" />
                                                <span>{el.instruction}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
