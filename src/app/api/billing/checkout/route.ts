import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro",
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();
    const priceId = PRICE_IDS[plan];

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Lazy Stripe initialization — only runs at request time, not build time
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia" as never,
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
      metadata: {
        userId: session.user.id,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
