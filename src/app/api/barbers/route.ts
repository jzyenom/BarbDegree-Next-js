import { NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import "@/models/Service";

type BarberResponse = {
  _id: string;
  name: string;
  address: string;
  state: string;
  country: string;
  charge: number | string;
  avatar: string;
  serviceCount: number;
  services: {
    _id: string;
    name: string;
    price: number;
    durationMinutes?: number;
  }[];
};

type BarberDocWithServices = {
  _id: { toString(): string };
  userId?: { name?: string; avatar?: string };
  address?: string;
  state?: string;
  country?: string;
  charge?: string;
  avatar?: string;
  toObject(options?: { virtuals?: boolean }): {
    services?: {
      _id: { toString(): string };
      name: string;
      price: number;
      durationMinutes?: number;
    }[];
  };
};

export async function GET() {
  try {
    await connectToDatabase();

    const barbers = (await Barber.find({})
      .populate("userId")
      .populate({
        path: "services",
        match: { isActive: true },
        options: { sort: { price: 1, name: 1 } },
      })) as BarberDocWithServices[];

    const results: BarberResponse[] = barbers.map((barber) => {
      const rawAvatar = barber.avatar ?? barber.userId?.avatar ?? "";
      const avatar =
        !rawAvatar || rawAvatar === "avatar.png" ? "/avatar.svg" : rawAvatar;
      const services = barber.toObject({ virtuals: true }).services ?? [];
      const lowestPrice = services[0]?.price;

      return {
        _id: barber._id.toString(),
        name: barber.userId?.name ?? "",
        address: barber.address ?? "",
        state: barber.state ?? "",
        country: barber.country ?? "",
        charge: lowestPrice ?? barber.charge ?? "",
        avatar,
        serviceCount: services.length,
        services: services.map((service) => ({
          _id: service._id.toString(),
          name: service.name,
          price: service.price,
          durationMinutes: service.durationMinutes,
        })),
      };
    });

    return NextResponse.json({ barbers: results });
  } catch (error) {
    console.error("Error fetching barbers:", error);
    return NextResponse.json(
      { error: "Failed to fetch barbers" },
      { status: 500 }
    );
  }
}
