import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);

    if (!sub?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Lazy Stripe initialization — only runs at request time, not build time
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia" as never,
    });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
