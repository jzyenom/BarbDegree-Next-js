/**
 * AUTO-FILE-COMMENT: src/app/api/barber/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Barber from "@/models/Barber";
import { isAdminRole } from "@/lib/roles";

const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;
const MAX_TEXT_LENGTH = 200;
const MAX_BIO_LENGTH = 800;

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
 * 17. Executes `const barber = await Barber.findOne({ userId: user._id }).select("_id");`.
 * 18. Executes `return NextResponse.json({ exists: !!barber }, { status: 200 });`.
 * 19. Executes `} catch (error) {`.
 * 20. Executes `console.error("Error checking barber profile:", error);`.
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

    const barber = await Barber.findOne({ userId: user._id }).select("_id");
    return NextResponse.json({ exists: !!barber }, { status: 200 });
  } catch (error) {
    console.error("Error checking barber profile:", error);
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
 * 6. Executes `const formData = await req.formData();`.
 * 7. Executes `const data: Record<string, unknown> = {};`.
 * 8. Executes `// Ignore files and only process known scalar fields`.
 * 9. Executes `formData.forEach((value, key) => {`.
 * 10. Executes `if (value instanceof File) return;`.
 * 11. Executes `data[key] = value;`.
 * 12. Executes `});`.
 * 13. Executes `const whatsapp = normalizeField(data.whatsapp, "whatsapp");`.
 * 14. Executes `if (!whatsapp.ok) {`.
 * 15. Executes `return NextResponse.json({ error: whatsapp.error }, { status: 400 });`.
 * 16. Executes `}`.
 * 17. Executes `const mobile = normalizeField(data.mobile, "mobile");`.
 * 18. Executes `if (!mobile.ok) {`.
 * 19. Executes `return NextResponse.json({ error: mobile.error }, { status: 400 });`.
 * 20. Executes `}`.
 * 21. Executes `const country = normalizeField(data.country, "country");`.
 * 22. Executes `if (!country.ok) {`.
 * 23. Executes `return NextResponse.json({ error: country.error }, { status: 400 });`.
 * 24. Executes `}`.
 * 25. Executes `const state = normalizeField(data.state, "state");`.
 * 26. Executes `if (!state.ok) {`.
 * 27. Executes `return NextResponse.json({ error: state.error }, { status: 400 });`.
 * 28. Executes `}`.
 * 29. Executes `const nin = normalizeField(data.nin, "nin");`.
 * 30. Executes `if (!nin.ok) {`.
 * 31. Executes `return NextResponse.json({ error: nin.error }, { status: 400 });`.
 * 32. Executes `}`.
 * 33. Executes `const bio = normalizeField(data.bio, "bio", MAX_BIO_LENGTH);`.
 * 34. Executes `if (!bio.ok) {`.
 * 35. Executes `return NextResponse.json({ error: bio.error }, { status: 400 });`.
 * 36. Executes `}`.
 * 37. Executes `const address = normalizeField(data.address, "address");`.
 * 38. Executes `if (!address.ok) {`.
 * 39. Executes `return NextResponse.json({ error: address.error }, { status: 400 });`.
 * 40. Executes `}`.
 * 41. Executes `const exp = normalizeField(data.exp, "exp");`.
 * 42. Executes `if (!exp.ok) {`.
 * 43. Executes `return NextResponse.json({ error: exp.error }, { status: 400 });`.
 * 44. Executes `}`.
 * 45. Executes `const charge = normalizeField(data.charge, "charge");`.
 * 46. Executes `if (!charge.ok) {`.
 * 47. Executes `return NextResponse.json({ error: charge.error }, { status: 400 });`.
 * 48. Executes `}`.
 * 49. Executes `const bankName = normalizeField(data.bankName, "bankName");`.
 * 50. Executes `if (!bankName.ok) {`.
 * 51. Executes `return NextResponse.json({ error: bankName.error }, { status: 400 });`.
 * 52. Executes `}`.
 * 53. Executes `const accountNo = normalizeField(data.accountNo, "accountNo");`.
 * 54. Executes `if (!accountNo.ok) {`.
 * 55. Executes `return NextResponse.json({ error: accountNo.error }, { status: 400 });`.
 * 56. Executes `}`.
 * 57. Executes `if (!PHONE_PATTERN.test(whatsapp.value) || !PHONE_PATTERN.test(mobile.value)) {`.
 * 58. Executes `return NextResponse.json({ error: "Invalid phone numbers" }, { status: 400 });`.
 * 59. Executes `}`.
 * 60. Executes `if (!/^\d{11}$/.test(nin.value)) {`.
 * 61. Executes `return NextResponse.json({ error: "NIN must be 11 digits" }, { status: 400 });`.
 * 62. Executes `}`.
 * 63. Executes `if (!/^\d{10}$/.test(accountNo.value)) {`.
 * 64. Executes `return NextResponse.json({ error: "Account number must be 10 digits" }, { status: 400 });`.
 * 65. Executes `}`.
 * 66. Executes `await connectToDatabase();`.
 * 67. Executes `const user = await User.findOne({ email: session.user.email.toLowerCase() }).select("_id");`.
 * 68. Executes `if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });`.
 * 69. Executes `const existingBarber = await Barber.findOne({ userId: user._id }).select("_id");`.
 * 70. Executes `if (existingBarber) {`.
 * 71. Executes `return NextResponse.json({ error: "Barber profile already exists" }, { status: 400 });`.
 * 72. Executes `}`.
 * 73. Executes `await Barber.create({`.
 * 74. Executes `userId: user._id,`.
 * 75. Executes `whatsapp: whatsapp.value,`.
 * 76. Executes `mobile: mobile.value,`.
 * 77. Executes `country: country.value,`.
 * 78. Executes `state: state.value,`.
 * 79. Executes `nin: nin.value,`.
 * 80. Executes `bio: bio.value,`.
 * 81. Executes `address: address.value,`.
 * 82. Executes `exp: exp.value,`.
 * 83. Executes `charge: charge.value,`.
 * 84. Executes `bankName: bankName.value,`.
 * 85. Executes `accountNo: accountNo.value,`.
 * 86. Executes `});`.
 * 87. Executes `return NextResponse.json({ message: "Barber registered successfully" });`.
 * 88. Executes `} catch (error) {`.
 * 89. Executes `console.error(error);`.
 * 90. Executes `return NextResponse.json({ error: "Failed to register barber" }, { status: 500 });`.
 * 91. Executes `}`.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const data: Record<string, unknown> = {};

    // Ignore files and only process known scalar fields
    formData.forEach((value, key) => {
      if (value instanceof File) return;
      data[key] = value;
    });

    const whatsapp = normalizeField(data.whatsapp, "whatsapp");
    if (!whatsapp.ok) {
      return NextResponse.json({ error: whatsapp.error }, { status: 400 });
    }
    const mobile = normalizeField(data.mobile, "mobile");
    if (!mobile.ok) {
      return NextResponse.json({ error: mobile.error }, { status: 400 });
    }
    const country = normalizeField(data.country, "country");
    if (!country.ok) {
      return NextResponse.json({ error: country.error }, { status: 400 });
    }
    const state = normalizeField(data.state, "state");
    if (!state.ok) {
      return NextResponse.json({ error: state.error }, { status: 400 });
    }
    const nin = normalizeField(data.nin, "nin");
    if (!nin.ok) {
      return NextResponse.json({ error: nin.error }, { status: 400 });
    }
    const bio = normalizeField(data.bio, "bio", MAX_BIO_LENGTH);
    if (!bio.ok) {
      return NextResponse.json({ error: bio.error }, { status: 400 });
    }
    const address = normalizeField(data.address, "address");
    if (!address.ok) {
      return NextResponse.json({ error: address.error }, { status: 400 });
    }
    const exp = normalizeField(data.exp, "exp");
    if (!exp.ok) {
      return NextResponse.json({ error: exp.error }, { status: 400 });
    }
    const charge = normalizeField(data.charge, "charge");
    if (!charge.ok) {
      return NextResponse.json({ error: charge.error }, { status: 400 });
    }
    const bankName = normalizeField(data.bankName, "bankName");
    if (!bankName.ok) {
      return NextResponse.json({ error: bankName.error }, { status: 400 });
    }
    const accountNo = normalizeField(data.accountNo, "accountNo");
    if (!accountNo.ok) {
      return NextResponse.json({ error: accountNo.error }, { status: 400 });
    }

    if (!PHONE_PATTERN.test(whatsapp.value) || !PHONE_PATTERN.test(mobile.value)) {
      return NextResponse.json({ error: "Invalid phone numbers" }, { status: 400 });
    }
    if (!/^\d{11}$/.test(nin.value)) {
      return NextResponse.json({ error: "NIN must be 11 digits" }, { status: 400 });
    }
    if (!/^\d{10}$/.test(accountNo.value)) {
      return NextResponse.json({ error: "Account number must be 10 digits" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({
      email: session.user.email.toLowerCase(),
    }).select("_id role");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role !== "barber") {
      return NextResponse.json(
        { error: "Select the barber role before completing this profile" },
        { status: 403 }
      );
    }

    const existingBarber = await Barber.findOne({ userId: user._id }).select("_id");
    if (existingBarber) {
      return NextResponse.json({ error: "Barber profile already exists" }, { status: 400 });
    }

    await Barber.create({
      userId: user._id,
      whatsapp: whatsapp.value,
      mobile: mobile.value,
      country: country.value,
      state: state.value,
      nin: nin.value,
      bio: bio.value,
      address: address.value,
      exp: exp.value,
      charge: charge.value,
      bankName: bankName.value,
      accountNo: accountNo.value,
    });

    return NextResponse.json({ message: "Barber registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register barber" }, { status: 500 });
  }
}
