import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Lazy Stripe initialization — only runs at request time, not build time
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia" as never,
    });
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          await db
            .insert(subscriptions)
            .values({
              userId,
              plan: plan as "free" | "pro" | "enterprise",
              status: "active",
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })
            .onConflictDoUpdate({
              target: subscriptions.userId,
              set: {
                plan: plan as "free" | "pro" | "enterprise",
                status: "active",
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(),
              },
            });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const subId = subscription.id;

        await db
          .update(subscriptions)
          .set({
            status: subscription.status === "active" ? "active" : "past_due",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subId));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await db
          .update(subscriptions)
          .set({
            status: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const invoiceSubId = invoice.subscription as string | null;
        if (invoiceSubId) {
          await db
            .update(subscriptions)
            .set({
              status: "past_due",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, invoiceSubId));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
