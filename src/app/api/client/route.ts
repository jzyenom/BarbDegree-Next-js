import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Client from "@/models/Client";
import { isAdminRole } from "@/lib/roles";

const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;
const MAX_TEXT_LENGTH = 200;

/**
 * AUTO-FUNCTION-COMMENT: normalizeField
 * Purpose: Handles normalize field.
 * Line-by-line:
 * 1. Executes `if (typeof value !== "string") {`.
 * 2. Executes `return { ok: false as const, error: \`${fieldName} is required\` };`.
 * 3. Executes `}`.
 * 4. Executes `const normalized = value.trim();`.
 * 5. Executes `if (!normalized) {`.
 * 6. Executes `return { ok: false as const, error: \`${fieldName} is required\` };`.
 * 7. Executes `}`.
 * 8. Executes `if (normalized.length > maxLength) {`.
 * 9. Executes `return { ok: false as const, error: \`${fieldName} is too long\` };`.
 * 10. Executes `}`.
 * 11. Executes `return { ok: true as const, value: normalized };`.
 */
function normalizeField(
  value: unknown,
  fieldName: string,
  maxLength = MAX_TEXT_LENGTH
) {
  if (typeof value !== "string") {
    return { ok: false as const, error: `${fieldName} is required` };
  }

  const normalized = value.trim();
  if (!normalized) {
    return { ok: false as const, error: `${fieldName} is required` };
  }
  if (normalized.length > maxLength) {
    return { ok: false as const, error: `${fieldName} is too long` };
  }

  return { ok: true as const, value: normalized };
}

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `try {`.
 * 2. Executes `const session = await getServerSession(authOptions);`.
 * 3. Executes `if (!session?.user?.email) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `const { searchParams } = new URL(req.url);`.
 * 7. Executes `const requestedEmail = searchParams.get("email")?.trim().toLowerCase();`.
 * 8. Executes `const sessionEmail = session.user.email.trim().toLowerCase();`.
 * 9. Executes `const isAdmin = isAdminRole(session.user.role);`.
 * 10. Executes `const email = requestedEmail || sessionEmail;`.
 * 11. Executes `if (!isAdmin && email !== sessionEmail) {`.
 * 12. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 13. Executes `}`.
 * 14. Executes `await connectToDatabase();`.
 * 15. Executes `const user = await User.findOne({ email }).select("_id");`.
 * 16. Executes `if (!user) return NextResponse.json({ exists: false }, { status: 200 });`.
 * 17. Executes `const client = await Client.findOne({ userId: user._id }).select("_id");`.
 * 18. Executes `return NextResponse.json({ exists: !!client }, { status: 200 });`.
 * 19. Executes `} catch (error) {`.
 * 20. Executes `console.error("Error checking client profile:", error);`.
 * 21. Executes `return NextResponse.json({ error: "Failed to check profile" }, { status: 500 });`.
 * 22. Executes `}`.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedEmail = searchParams.get("email")?.trim().toLowerCase();
    const sessionEmail = session.user.email.trim().toLowerCase();
    const isAdmin = isAdminRole(session.user.role);

    const email = requestedEmail || sessionEmail;
    if (!isAdmin && email !== sessionEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email }).select("_id");
    if (!user) return NextResponse.json({ exists: false }, { status: 200 });

    const client = await Client.findOne({ userId: user._id }).select("_id");
    return NextResponse.json({ exists: !!client }, { status: 200 });
  } catch (error) {
    console.error("Error checking client profile:", error);
    return NextResponse.json({ error: "Failed to check profile" }, { status: 500 });
  }
}

/**
 * AUTO-FUNCTION-COMMENT: POST
 * Purpose: Handles post.
 * Line-by-line:
 * 1. Executes `try {`.
 * 2. Executes `const session = await getServerSession(authOptions);`.
 * 3. Executes `if (!session?.user?.email) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `const body = (await req.json()) as Record<string, unknown>;`.
 * 7. Executes `const whatsapp = normalizeField(body.whatsapp, "whatsapp");`.
 * 8. Executes `if (!whatsapp.ok) {`.
 * 9. Executes `return NextResponse.json({ error: whatsapp.error }, { status: 400 });`.
 * 10. Executes `}`.
 * 11. Executes `const mobile = normalizeField(body.mobile, "mobile");`.
 * 12. Executes `if (!mobile.ok) {`.
 * 13. Executes `return NextResponse.json({ error: mobile.error }, { status: 400 });`.
 * 14. Executes `}`.
 * 15. Executes `const country = normalizeField(body.country, "country");`.
 * 16. Executes `if (!country.ok) {`.
 * 17. Executes `return NextResponse.json({ error: country.error }, { status: 400 });`.
 * 18. Executes `}`.
 * 19. Executes `const state = normalizeField(body.state, "state");`.
 * 20. Executes `if (!state.ok) {`.
 * 21. Executes `return NextResponse.json({ error: state.error }, { status: 400 });`.
 * 22. Executes `}`.
 * 23. Executes `const address = normalizeField(body.address, "address", 300);`.
 * 24. Executes `if (!address.ok) {`.
 * 25. Executes `return NextResponse.json({ error: address.error }, { status: 400 });`.
 * 26. Executes `}`.
 * 27. Executes `if (!PHONE_PATTERN.test(whatsapp.value) || !PHONE_PATTERN.test(mobile.value)) {`.
 * 28. Executes `return NextResponse.json({ error: "Invalid phone numbers" }, { status: 400 });`.
 * 29. Executes `}`.
 * 30. Executes `await connectToDatabase();`.
 * 31. Executes `const user = await User.findOne({ email: session.user.email.toLowerCase() }).select("_id");`.
 * 32. Executes `if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });`.
 * 33. Executes `const existingClient = await Client.findOne({ userId: user._id }).select("_id");`.
 * 34. Executes `if (existingClient) {`.
 * 35. Executes `return NextResponse.json({ error: "Client profile already exists" }, { status: 400 });`.
 * 36. Executes `}`.
 * 37. Executes `await Client.create({`.
 * 38. Executes `userId: user._id,`.
 * 39. Executes `whatsapp: whatsapp.value,`.
 * 40. Executes `mobile: mobile.value,`.
 * 41. Executes `country: country.value,`.
 * 42. Executes `state: state.value,`.
 * 43. Executes `address: address.value,`.
 * 44. Executes `});`.
 * 45. Executes `return NextResponse.json({ message: "Client registered successfully" });`.
 * 46. Executes `} catch (error) {`.
 * 47. Executes `console.error(error);`.
 * 48. Executes `return NextResponse.json({ error: "Failed to register client" }, { status: 500 });`.
 * 49. Executes `}`.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    const whatsapp = normalizeField(body.whatsapp, "whatsapp");
    if (!whatsapp.ok) {
      return NextResponse.json({ error: whatsapp.error }, { status: 400 });
    }

    const mobile = normalizeField(body.mobile, "mobile");
    if (!mobile.ok) {
      return NextResponse.json({ error: mobile.error }, { status: 400 });
    }

    const country = normalizeField(body.country, "country");
    if (!country.ok) {
      return NextResponse.json({ error: country.error }, { status: 400 });
    }

    const state = normalizeField(body.state, "state");
    if (!state.ok) {
      return NextResponse.json({ error: state.error }, { status: 400 });
    }

    const address = normalizeField(body.address, "address", 300);
    if (!address.ok) {
      return NextResponse.json({ error: address.error }, { status: 400 });
    }

    if (!PHONE_PATTERN.test(whatsapp.value) || !PHONE_PATTERN.test(mobile.value)) {
      return NextResponse.json({ error: "Invalid phone numbers" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({
      email: session.user.email.toLowerCase(),
    }).select("_id role");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role !== "client") {
      return NextResponse.json(
        { error: "Select the client role before completing this profile" },
        { status: 403 }
      );
    }

    const existingClient = await Client.findOne({ userId: user._id }).select("_id");
    if (existingClient) {
      return NextResponse.json({ error: "Client profile already exists" }, { status: 400 });
    }

    await Client.create({
      userId: user._id,
      whatsapp: whatsapp.value,
      mobile: mobile.value,
      country: country.value,
      state: state.value,
      address: address.value,
    });

    return NextResponse.json({ message: "Client registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register client" }, { status: 500 });
  }
}
