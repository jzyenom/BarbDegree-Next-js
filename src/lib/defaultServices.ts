import type mongoose from "mongoose";
import { DEFAULT_BARBER_SERVICES } from "@/config/defaultBarberServices";
import Service from "@/models/Service";

type BarberId = string | mongoose.Types.ObjectId | { toString(): string };

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
