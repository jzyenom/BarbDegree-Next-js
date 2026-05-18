import crypto from "crypto";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { validateWebhookSignature, verifyTransaction } from "@/lib/paystack";
import {
  activateBarberSubscription,
  deactivateBarberSubscription,
  type SubscriptionInterval,
} from "@/lib/subscription-helpers";
import Barber from "@/models/Barber";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";

type PaystackWebhook = {
  event?: string;
  data?: Record<string, unknown>;
};

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getReference(data: Record<string, unknown>) {
  return toStringValue(data.reference) || toStringValue(data.transaction_reference);
}

function getSubscriptionCode(data: Record<string, unknown>) {
  const subscription = data.subscription;
  if (typeof subscription === "string") return subscription;
  if (subscription && typeof subscription === "object") {
    return toStringValue((subscription as Record<string, unknown>).subscription_code);
  }
  return toStringValue(data.subscription_code);
}

function getCustomerCode(data: Record<string, unknown>) {
  const customer = data.customer;
  if (customer && typeof customer === "object") {
    return toStringValue((customer as Record<string, unknown>).customer_code);
  }
  return toStringValue(data.customer_code);
}

function getMetadata(data: Record<string, unknown>) {
  return data.metadata && typeof data.metadata === "object"
    ? (data.metadata as Record<string, unknown>)
    : {};
}

function getEventKey(event: string, data: Record<string, unknown>) {
  const id = data.id == null ? "" : String(data.id);
  const reference = getReference(data);
  const subscriptionCode = getSubscriptionCode(data);
  const paidAt = toStringValue(data.paid_at);
  return crypto
    .createHash("sha256")
    .update([event, id, reference, subscriptionCode, paidAt].join(":"))
    .digest("hex");
}

async function findSubscription(data: Record<string, unknown>) {
  const reference = getReference(data);
  if (reference) return Subscription.findOne({ reference });

  const subscriptionCode = getSubscriptionCode(data);
  if (subscriptionCode) {
    return Subscription.findOne({ subscriptionCode }).sort({ createdAt: -1 });
  }

  const metadata = getMetadata(data);
  const metadataReference = toStringValue(metadata.reference);
  if (metadataReference) return Subscription.findOne({ reference: metadataReference });

  return null;
}

async function processSuccessfulPayment(
  subscription: Awaited<ReturnType<typeof findSubscription>>,
  data: Record<string, unknown>,
  session: mongoose.ClientSession
) {
  if (!subscription) return;
  const plan = await Plan.findById(subscription.planId).session(session);
  if (!plan) return;

  const reference = subscription.reference;
  const verified = await verifyTransaction(reference);
  const verifiedData = verified.data;
  if (!verifiedData || verifiedData.status !== "success") {
    throw new Error("Paystack transaction verification failed");
  }

  await activateBarberSubscription(
    {
      barberId: subscription.barberId,
      planId: subscription.planId,
      reference,
      interval: plan.interval as SubscriptionInterval,
      subscriptionCode: getSubscriptionCode(data) || getSubscriptionCode(verifiedData),
      customerCode: getCustomerCode(data) || verifiedData.customer?.customer_code,
      paidAt: verifiedData.paid_at ? new Date(verifiedData.paid_at) : new Date(),
      providerResponse: verifiedData,
    },
    session
  );
}

async function processFailure(
  subscription: Awaited<ReturnType<typeof findSubscription>>,
  data: Record<string, unknown>,
  session: mongoose.ClientSession
) {
  if (!subscription) return;
  await deactivateBarberSubscription(
    {
      barberId: subscription.barberId,
      reference: subscription.reference,
      providerResponse: data,
    },
    session
  );
}

async function processDisable(data: Record<string, unknown>, session: mongoose.ClientSession) {
  const subscription = await findSubscription(data);
  const subscriptionCode = getSubscriptionCode(data);
  if (subscription) {
    await Subscription.findByIdAndUpdate(
      subscription._id,
      {
        status: "cancelled",
        subscriptionCode: subscriptionCode || subscription.subscriptionCode,
        providerResponse: data,
      },
      { session }
    );
    await deactivateBarberSubscription(
      {
        barberId: subscription.barberId,
        reference: subscription.reference,
        status: "cancelled",
        subscriptionStatus: "cancelled",
        providerResponse: data,
        title: "Subscription Cancelled",
        message: "Your subscription was cancelled and your barber account is no longer bookable.",
        notificationType: "warning",
      },
      session
    );
    return;
  }

  if (subscriptionCode) {
    const barber = await Barber.findOne({ subscriptionReference: subscriptionCode }).session(session);
    if (barber) {
      await deactivateBarberSubscription(
        {
          barberId: barber._id,
          status: "cancelled",
          title: "Subscription Cancelled",
          message: "Your subscription was cancelled and your barber account is no longer bookable.",
          notificationType: "warning",
        },
        session
      );
    }
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!validateWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: PaystackWebhook;
  try {
    payload = JSON.parse(rawBody) as PaystackWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const event = payload.event;
  const data = payload.data;
  if (!event || !data) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  await connectToDatabase();
  const eventKey = getEventKey(event, data);
  const subscription = await findSubscription(data);

  if (subscription?.processedWebhookEventKeys?.includes(eventKey)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (event === "charge.success" || event === "subscription.create") {
        await processSuccessfulPayment(subscription, data, session);
      } else if (event === "invoice.payment_failed") {
        await processFailure(subscription, data, session);
      } else if (event === "subscription.disable") {
        await processDisable(data, session);
      }

      if (subscription) {
        await Subscription.updateOne(
          { _id: subscription._id, processedWebhookEventKeys: { $ne: eventKey } },
          { $addToSet: { processedWebhookEventKeys: eventKey } },
          { session }
        );
      }
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  } finally {
    await session.endSession();
  }

  return NextResponse.json({ received: true });
}
