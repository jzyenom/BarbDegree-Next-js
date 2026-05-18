import { NextRequest } from "next/server";
import { GET as verifyGet, POST as verifyPost } from "@/app/api/subscriptions/verify/route";

export async function GET(req: NextRequest) {
  return verifyGet(req);
}

export async function POST(req: NextRequest) {
  return verifyPost(req);
}
