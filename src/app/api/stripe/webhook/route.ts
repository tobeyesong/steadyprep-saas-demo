import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseStripeSignature(header: string) {
  return header.split(",").reduce(
    (parts, item) => {
      const [key, value] = item.split("=");

      if (key === "t") {
        parts.timestamp = value;
      }

      if (key === "v1") {
        parts.signatures.push(value);
      }

      return parts;
    },
    { timestamp: "", signatures: [] as string[] },
  );
}

function verifyStripeSignature({
  payload,
  signatureHeader,
  webhookSecret,
}: {
  payload: string;
  signatureHeader: string;
  webhookSecret: string;
}) {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature);

  return signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature);

    return (
      signatureBuffer.length === expectedBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedBuffer)
    );
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 503 },
    );
  }

  const payload = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");

  if (
    !signatureHeader ||
    !verifyStripeSignature({ payload, signatureHeader, webhookSecret })
  ) {
    return Response.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type?: string;
    data?: { object?: { id?: string; customer?: string; subscription?: string } };
  };

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.payment_succeeded":
    case "customer.subscription.deleted":
      break;
    default:
      return Response.json({ received: true, ignored: event.type ?? "unknown" });
  }

  return Response.json({
    received: true,
    handled: event.type,
    objectId: event.data?.object?.id,
  });
}
