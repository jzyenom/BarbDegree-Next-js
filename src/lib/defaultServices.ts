import type mongoose from "mongoose";
import Service from "@/models/Service";

type BarberId = string | mongoose.Types.ObjectId | { toString(): string };

export const DEFAULT_BARBER_SERVICES = [
  {
    name: "Trimming",
    nameKey: "trimming",
    description: "Default trimming service",
    price: 3000,
    durationMinutes: 30,
  },
  {
    name: "Shaving",
    nameKey: "shaving",
    description: "Default shaving service",
    price: 1500,
    durationMinutes: 20,
  },
  {
    name: "Dyeing",
    nameKey: "dyeing",
    description: "Default dyeing service",
    price: 5000,
    durationMinutes: 60,
  },
] as const;

function normalizeBarberId(barberId: BarberId) {
  return barberId.toString();
}

export async function ensureDefaultServicesForBarber(barberId: BarberId) {
  const normalizedBarberId = normalizeBarberId(barberId);

  await Service.bulkWrite(
    DEFAULT_BARBER_SERVICES.map((service) => ({
      updateOne: {
        filter: {
          barberId: normalizedBarberId,
          nameKey: service.nameKey,
        },
        update: {
          $setOnInsert: {
            barberId: normalizedBarberId,
            name: service.name,
            nameKey: service.nameKey,
            description: service.description,
            price: service.price,
            durationMinutes: service.durationMinutes,
            isActive: true,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );
}

export async function ensureDefaultServicesForBarbers(barberIds: BarberId[]) {
  const normalizedIds = Array.from(new Set(barberIds.map(normalizeBarberId))).filter(Boolean);
  if (normalizedIds.length === 0) return;

  await Service.bulkWrite(
    normalizedIds.flatMap((barberId) =>
      DEFAULT_BARBER_SERVICES.map((service) => ({
        updateOne: {
          filter: {
            barberId,
            nameKey: service.nameKey,
          },
          update: {
            $setOnInsert: {
              barberId,
              name: service.name,
              nameKey: service.nameKey,
              description: service.description,
              price: service.price,
              durationMinutes: service.durationMinutes,
              isActive: true,
            },
          },
          upsert: true,
        },
      }))
    ),
    { ordered: false }
  );
}
