import mongoose from "mongoose";
import Barber from "@/models/Barber";
import Notification from "@/models/Notification";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";
import Transaction from "@/models/Transaction";

export type SubscriptionInterval = "monthly" | "biannually" | "annually";
export type SubscriptionStatus = "pending" | "success" | "failed" | "cancelled";

type DbSession = mongoose.ClientSession | null | undefined;

export const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    name: "Basic",
    amount: 7000,
    interval: "monthly" as const,
    paystackPlanCode: "PLN_88bwjk8mz3n7xw7",
  },
  {
    name: "Standard",
    amount: 35000,
    interval: "biannually" as const,
    paystackPlanCode: "PLN_u4shtuzzt58a454",
  },
  {
    name: "Premium",
    amount: 60000,
    interval: "annually" as const,
    paystackPlanCode: "PLN_kvdqz349nx2dr54",
  },
];

export function calculateSubscriptionExpiry(
  interval: SubscriptionInterval,
  fromDate = new Date()
) {
  const expiresAt = new Date(fromDate);
  if (interval === "monthly") expiresAt.setMonth(expiresAt.getMonth() + 1);
  if (interval === "biannually") expiresAt.setMonth(expiresAt.getMonth() + 6);
  if (interval === "annually") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  return expiresAt;
}

export function hasActiveSubscription(barber: {
  adminSubscriptionOverride?: boolean;
  adminForcedSubscriptionStatus?: boolean;
  subscriptionActive?: boolean;
}) {
  return barber.adminSubscriptionOverride
    ? Boolean(barber.adminForcedSubscriptionStatus)
    : Boolean(barber.subscriptionActive);
}

export async function ensureDefaultSubscriptionPlans() {
  await Promise.all(
    DEFAULT_SUBSCRIPTION_PLANS.map((plan) =>
      Plan.findOneAndUpdate(
        { paystackPlanCode: plan.paystackPlanCode },
        { $setOnInsert: { ...plan, isActive: true } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );
}

export async function createSubscriptionNotification(
  input: {
    userId: mongoose.Types.ObjectId | string;
    title: string;
    message: string;
    type: string;
    data?: Record<string, unknown>;
  },
  session?: DbSession
) {
  const [notification] = await Notification.create(
    [
      {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        data: input.data ?? {},
      },
    ],
    { session }
  );
  return notification;
}

export async function updateSubscriptionStatus(
  reference: string,
  status: SubscriptionStatus,
  providerResponse?: unknown,
  session?: DbSession
) {
  return Subscription.findOneAndUpdate(
    { reference },
    {
      status,
      ...(providerResponse ? { providerResponse } : {}),
    },
    { new: true, session }
  );
}

export async function activateBarberSubscription(
  input: {
    barberId: mongoose.Types.ObjectId | string;
    planId: mongoose.Types.ObjectId | string;
    reference: string;
    interval: SubscriptionInterval;
    subscriptionCode?: string;
    customerCode?: string;
    nextPaymentDate?: Date;
    paidAt?: Date;
    providerResponse?: unknown;
  },
  session?: DbSession
) {
  const activatedAt = input.paidAt ?? new Date();
  const expiresAt =
    input.nextPaymentDate ?? calculateSubscriptionExpiry(input.interval, activatedAt);

  const barber = await Barber.findByIdAndUpdate(
    input.barberId,
    {
      subscriptionStatus: "active",
      subscriptionActive: true,
      isSubscribed: true,
      currentPlanId: input.planId,
      subscriptionReference: input.reference,
      subscriptionActivatedAt: activatedAt,
      subscriptionExpiresAt: expiresAt,
      subscriptionAutoRenew: true,
    },
    { new: true, session }
  );

  await Subscription.findOneAndUpdate(
    { reference: input.reference },
    {
      status: "success",
      subscriptionCode: input.subscriptionCode,
      customerCode: input.customerCode,
      nextPaymentDate: input.nextPaymentDate,
      paidAt: activatedAt,
      providerResponse: input.providerResponse,
    },
    { new: true, session }
  );

  await Transaction.findOneAndUpdate(
    { reference: input.reference },
    {
      status: "success",
      providerResponse: input.providerResponse,
    },
    { session }
  );

  if (barber?.userId) {
    await createSubscriptionNotification(
      {
        userId: barber.userId,
        title: "Subscription Activated",
        message:
          "Your subscription payment was successful and your barber account is now active.",
        type: "success",
        data: { reference: input.reference },
      },
      session
    );
  }

  return barber;
}

export async function deactivateBarberSubscription(
  input: {
    barberId: mongoose.Types.ObjectId | string;
    reference?: string;
    status?: "inactive" | "cancelled";
    subscriptionStatus?: SubscriptionStatus;
    transactionStatus?: "failed" | "pending" | "success";
    providerResponse?: unknown;
    title?: string;
    message?: string;
    notificationType?: string;
  },
  session?: DbSession
) {
  const barberStatus = input.status ?? "inactive";
  const barber = await Barber.findByIdAndUpdate(
    input.barberId,
    {
      subscriptionStatus: barberStatus,
      subscriptionActive: false,
      isSubscribed: false,
      subscriptionAutoRenew: barberStatus !== "cancelled",
    },
    { new: true, session }
  );

  if (input.reference) {
    await Subscription.findOneAndUpdate(
      { reference: input.reference },
      {
        status: input.subscriptionStatus ?? "failed",
        providerResponse: input.providerResponse,
      },
      { session }
    );
    await Transaction.findOneAndUpdate(
      { reference: input.reference },
      {
        status: input.transactionStatus ?? "failed",
        providerResponse: input.providerResponse,
      },
      { session }
    );
  }

  if (barber?.userId) {
    await createSubscriptionNotification(
      {
        userId: barber.userId,
        title: input.title ?? "Subscription Payment Failed",
        message:
          input.message ??
          "We could not process your subscription payment. Your account access may be restricted.",
        type: input.notificationType ?? "error",
        data: input.reference ? { reference: input.reference } : {},
      },
      session
    );
  }

  return barber;
}
