import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const isSubscribed = Boolean(body.isSubscribed);
  const request = new NextRequest(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({
      barberId: body.barberId,
      enabled: true,
      forcedStatus: isSubscribed,
    }),
  });
  const { POST } = await import("@/app/api/admin/subscriptions/toggle-status/route");
  return POST(request);
}
