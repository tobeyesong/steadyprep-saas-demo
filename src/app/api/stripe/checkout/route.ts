const STRIPE_CHECKOUT_SESSIONS_URL =
  "https://api.stripe.com/v1/checkout/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getOrigin(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  return new URL(request.url).origin;
}

function appendInlineSubscriptionPrice(params: URLSearchParams) {
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", "5000");
  params.set("line_items[0][price_data][recurring][interval]", "month");
  params.set("line_items[0][price_data][product_data][name]", "SteadyPrep Plus");
  params.set(
    "line_items[0][price_data][product_data][description]",
    "AP Precalculus practice, progress tracking, and AI grading credits",
  );
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return Response.json(
      { error: "Stripe server key is not configured for this deployment." },
      { status: 503 },
    );
  }

  if (!secretKey.startsWith("sk_test_")) {
    return Response.json(
      { error: "This demo only accepts Stripe test-mode secret keys." },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    customerEmail?: unknown;
  };
  const origin = getOrigin(request);
  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][quantity]": "1",
    client_reference_id: "demo_student_42",
    success_url: `${origin}/?stripe=success&session_id={CHECKOUT_SESSION_ID}#demo`,
    cancel_url: `${origin}/?stripe=cancelled#demo`,
    "metadata[app]": "steadyprep",
    "metadata[student_id]": "demo_student_42",
    "subscription_data[metadata][app]": "steadyprep",
    "subscription_data[metadata][student_id]": "demo_student_42",
  });
  const configuredPriceId = process.env.STRIPE_PRICE_ID;

  if (configuredPriceId) {
    params.set("line_items[0][price]", configuredPriceId);
  } else {
    appendInlineSubscriptionPrice(params);
  }

  if (typeof body.customerEmail === "string" && body.customerEmail.includes("@")) {
    params.set("customer_email", body.customerEmail);
  } else {
    params.set("customer_email", "demo.student@example.com");
  }

  const stripeResponse = await fetch(STRIPE_CHECKOUT_SESSIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const payload = (await stripeResponse.json().catch(() => null)) as
    | {
        id?: string;
        mode?: string;
        url?: string;
        error?: { message?: string };
      }
    | null;

  if (!stripeResponse.ok || !payload?.url) {
    return Response.json(
      {
        error:
          payload?.error?.message ??
          "Stripe did not return a Checkout URL for this test session.",
      },
      { status: stripeResponse.status || 502 },
    );
  }

  return Response.json({
    id: payload.id,
    mode: payload.mode,
    url: payload.url,
  });
}
