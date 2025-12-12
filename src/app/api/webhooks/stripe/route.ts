/**
 * Stripe Webhook Handler
 * Processes Stripe events and syncs to Supabase
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(request: Request) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;

                if (userId) {
                    // Upsert subscription
                    await supabase.from("subscriptions").upsert({
                        user_id: userId,
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        status: "active",
                        plan: "pro",
                    }, {
                        onConflict: "user_id",
                    });

                    // Update usage limits
                    await supabase.from("usage").upsert({
                        user_id: userId,
                        credits_limit: 999999, // Unlimited for Pro
                    }, {
                        onConflict: "user_id",
                    });
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by customer ID
                const { data: sub } = await supabase
                    .from("subscriptions")
                    .select("user_id")
                    .eq("stripe_customer_id", customerId)
                    .single();

                if (sub) {
                    await supabase
                        .from("subscriptions")
                        .update({
                            status: subscription.status,
                        })
                        .eq("user_id", sub.user_id);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user and downgrade
                const { data: sub } = await supabase
                    .from("subscriptions")
                    .select("user_id")
                    .eq("stripe_customer_id", customerId)
                    .single();

                if (sub) {
                    await supabase
                        .from("subscriptions")
                        .update({
                            status: "canceled",
                            plan: "free",
                        })
                        .eq("user_id", sub.user_id);

                    // Reset usage limits
                    await supabase
                        .from("usage")
                        .update({ credits_limit: 3 })
                        .eq("user_id", sub.user_id);
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook handler error:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}
