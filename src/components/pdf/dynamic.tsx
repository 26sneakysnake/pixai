/**
 * Client-only PDF Components Wrapper
 * Utilise next/dynamic pour éviter le bundling SSR de pdfjs-dist
 */

"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";

// Loader pendant le chargement dynamique
function PDFLoading() {
    return (
        <Card className="p-8">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted animate-pulse" />
                <p className="text-muted-foreground">Chargement du module PDF...</p>
            </div>
        </Card>
    );
}

// Import dynamique du PDFUploader (sans SSR)
export const DynamicPDFUploader = dynamic(
    () => import("./pdf-uploader").then((mod) => mod.PDFUploader),
    {
        ssr: false,
        loading: () => <PDFLoading />,
    }
);

// Import dynamique du PDFPreview (sans SSR)
export const DynamicPDFPreview = dynamic(
    () => import("./pdf-preview").then((mod) => mod.PDFPreview),
    {
        ssr: false,
        loading: () => <PDFLoading />,
    }
);
