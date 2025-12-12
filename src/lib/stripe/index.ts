/**
 * Stripe Server Client
 * For use in Server Actions and API Routes only
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-11-17.clover",
    typescript: true,
});

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession({
    priceId,
    userId,
    userEmail,
    successUrl,
    cancelUrl,
}: {
    priceId: string;
    userId: string;
    userEmail: string;
    successUrl: string;
    cancelUrl: string;
}) {
    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        metadata: {
            userId,
        },
        subscription_data: {
            metadata: {
                userId,
            },
        },
    });

    return session;
}

/**
 * Create a Stripe Billing Portal Session
 */
export async function createBillingPortalSession({
    customerId,
    returnUrl,
}: {
    customerId: string;
    returnUrl: string;
}) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session;
}
