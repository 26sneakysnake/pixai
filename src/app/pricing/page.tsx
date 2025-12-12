/**
 * Pricing Page
 * Shows plans and handles Stripe Checkout
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const plans = [
    {
        id: "free",
        name: "Gratuit",
        description: "Pour découvrir l'outil",
        price: "0€",
        priceDetail: "pour toujours",
        features: [
            "3 générations par mois",
            "Templates basiques",
            "Export en instructions",
        ],
        cta: "Commencer gratuitement",
        popular: false,
    },
    {
        id: "pro",
        name: "Pro",
        description: "Pour les professionnels",
        price: "19€",
        priceDetail: "par mois",
        features: [
            "Générations illimitées",
            "Tous les templates",
            "Export PPTX automatique",
            "Support prioritaire",
            "Historique complet",
        ],
        cta: "Passer à Pro",
        popular: true,
    },
];

export default function PricingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        if (planId === "free") {
            router.push("/");
            return;
        }

        setLoading(planId);

        try {
            const supabase = getSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login?redirect=/pricing");
                return;
            }

            // Call server action to create checkout session
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
                }),
            });

            const { url, error } = await response.json();

            if (error) {
                console.error("Checkout error:", error);
                return;
            }

            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Tarifs simples
                    </Badge>
                    <h1 className="text-4xl font-bold text-gradient-primary mb-4">
                        Choisissez votre plan
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Commencez gratuitement, passez à Pro quand vous êtes prêt.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative glass-surface ${plan.popular ? "ring-2 ring-indigo-500 glow-indigo" : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-indigo-500 text-white">
                                        <Zap className="w-3 h-3 mr-1" />
                                        Populaire
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-xl text-slate-100">{plan.name}</CardTitle>
                                <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="text-center">
                                    <span className="text-4xl font-bold text-slate-100">{plan.price}</span>
                                    <span className="text-slate-400 ml-2">{plan.priceDetail}</span>
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full ${plan.popular
                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                                            : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                                        }`}
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={loading === plan.id}
                                >
                                    {loading === plan.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        plan.cta
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 text-center text-sm text-slate-500">
                    <p>Besoin d&apos;aide ? Contactez-nous à support@slidearchitect.ai</p>
                </div>
            </div>
        </div>
    );
}
