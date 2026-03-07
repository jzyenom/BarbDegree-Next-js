import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Client from "@/models/Client";
import Barber from "@/models/Barber";

type SelectableRole = "barber" | "client";

function parseSelectableRole(value: unknown): SelectableRole | null {
  if (value === "barber" || value === "client") {
    return value;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const role = parseSelectableRole(payload?.role);
    if (!role) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectToDatabase();
    const email = session.user.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select("_id role");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentRole = user.role as string | undefined;
    if (currentRole === "admin" || currentRole === "superadmin") {
      return NextResponse.json(
        { error: "Role cannot be changed for this account" },
        { status: 403 }
      );
    }

    // Prevent cross-role changes once profile data exists.
    if (role === "barber") {
      const existingClient = await Client.findOne({ userId: user._id }).select(
        "_id"
      );
      if (existingClient) {
        return NextResponse.json(
          {
            error:
              "Client profile already exists. Use a separate account for barber registration.",
          },
          { status: 409 }
        );
      }
    }

    if (role === "client") {
      const existingBarber = await Barber.findOne({ userId: user._id }).select(
        "_id"
      );
      if (existingBarber) {
        return NextResponse.json(
          {
            error:
              "Barber profile already exists. Use a separate account for client registration.",
          },
          { status: 409 }
        );
      }
    }

    if (currentRole === role) {
      return NextResponse.json({
        message: "Role already set",
        user: { id: user._id.toString(), role },
      });
    }

    user.role = role;
    await user.save();

    return NextResponse.json({
      message: "Role updated",
      user: { id: user._id.toString(), role: user.role },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
