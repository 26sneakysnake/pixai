/**
 * Stripe Checkout API Route
 * Creates a Stripe Checkout Session
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { priceId } = await request.json();

        if (!priceId) {
            return NextResponse.json(
                { error: "Price ID is required" },
                { status: 400 }
            );
        }

        const origin = request.headers.get("origin") || "http://localhost:3000";

        const session = await createCheckoutSession({
            priceId,
            userId: user.id,
            userEmail: user.email!,
            successUrl: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${origin}/pricing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
