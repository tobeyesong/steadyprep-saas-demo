"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Check,
  ChevronRight,
  CreditCard,
  Database,
  GraduationCap,
  LockKeyhole,
  Menu,
  ReceiptText,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  Zap,
} from "lucide-react";

const navItems = ["Demo", "Plan", "Architecture", "Student app", "Billing"];
const tabs = ["Launch plan", "Architecture", "Student app", "Demo flow"] as const;

type Tab = (typeof tabs)[number];
type DemoStage = "visitor" | "signed-in" | "subscribed";
type CheckoutStatus = "idle" | "loading" | "error";

const metrics = [
  { label: "Subscription", value: "$50", note: "Simulated monthly plan" },
  { label: "Credits", value: "124", note: "AI grading calls left" },
  { label: "Stripe mode", value: "Test", note: "No live charges" },
  { label: "Security", value: "RLS", note: "Per-student data isolation" },
];

const architecture = [
  {
    title: "Next.js on Vercel",
    description:
      "Converts the CDN prototype into a typed React app with server routes, deployment previews, and production environment separation.",
    icon: ServerCog,
  },
  {
    title: "Supabase auth and data",
    description:
      "Stores profiles, attempts, progress, question state, credits, and subscription entitlements behind row-level security.",
    icon: Database,
  },
  {
    title: "Stripe subscriptions",
    description:
      "Creates the $50 monthly plan, checkout, webhooks, billing portal, and automated credit grants after successful payment.",
    icon: CreditCard,
  },
  {
    title: "Anthropic proxy",
    description:
      "Moves rubric grading server-side, validates every request, tracks usage, and keeps the Claude API key out of the browser.",
    icon: Bot,
  },
];

const sprint = [
  {
    day: "Day 1",
    title: "Prototype conversion",
    items: ["Next.js structure", "Vercel env map", "Supabase schema"],
  },
  {
    day: "Day 2",
    title: "Auth and persistence",
    items: ["Signup and login", "RLS policies", "Progress migration"],
  },
  {
    day: "Day 3",
    title: "Payments and credits",
    items: ["Stripe checkout", "Webhook grants", "Billing portal"],
  },
  {
    day: "Day 4",
    title: "AI grading proxy",
    items: ["Server-side Claude calls", "Credit enforcement", "Rubric audit logs"],
  },
  {
    day: "Day 5",
    title: "Launch hardening",
    items: ["QA pass", "Security review", "Production deploy"],
  },
];

const schemaRows = [
  ["profiles", "User identity, role, AP course, subscription status"],
  ["attempts", "Question attempts, rubric scores, grading feedback"],
  ["credit_ledger", "Monthly grants, grading debits, webhook references"],
  ["question_state", "Per-user favorites, skips, review flags, progress"],
];

const demoLedgerEvents = [
  "supabase.auth.signInWithPassword returned demo_student_42.",
  "profiles row loaded through user_id = auth.uid().",
  "POST /api/stripe/checkout created a test Checkout Session.",
  "Stripe webhook route verifies stripe-signature before credit grants.",
  "credit_ledger inserts +150 monthly credits after payment success.",
];

const stripeTestCard = [
  ["Card number", "4242 4242 4242 4242"],
  ["Expiration", "12 / 34"],
  ["CVC", "123"],
  ["ZIP", "94107"],
  ["Email", "demo.student@example.com"],
];

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function LogoMark() {
  return (
    <Link href="/" aria-label="Homepage" className="flex min-w-0 items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-600 text-white ring-1 ring-teal-700">
        <GraduationCap className="size-5 shrink-0" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base/6 font-semibold text-zinc-950 sm:text-sm/6">
          SteadyPrep
        </span>
        <span className="block truncate text-base/6 text-zinc-500 sm:text-sm/6">
          AP Precalculus SaaS launch
        </span>
      </span>
    </Link>
  );
}

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu overlay"
        className="absolute inset-0 bg-zinc-950/20"
        onClick={onClose}
      />
      <div className="absolute inset-x-4 top-4 rounded-lg bg-white p-4 shadow-xl ring-1 ring-zinc-950/10">
        <div className="flex items-center justify-between gap-4">
          <LogoMark />
          <button
            type="button"
            aria-label="Close navigation"
            className="relative grid size-9 shrink-0 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-950/5"
            onClick={onClose}
          >
            <span
              className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
              aria-hidden="true"
            />
            <X className="size-5 shrink-0" aria-hidden="true" />
          </button>
        </div>
        <nav className="mt-5 grid gap-1">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="rounded-lg px-3 py-2.5 text-base/7 text-zinc-700 hover:bg-zinc-950/5"
              onClick={onClose}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-zinc-950/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <LogoMark />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm/6 text-zinc-600 hover:text-zinc-950"
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="hidden items-center justify-end lg:flex">
          <a
            href="#plan"
            className="rounded-lg px-3 py-2 text-sm/6 font-medium text-zinc-700 ring-1 ring-zinc-950/10 hover:bg-zinc-950/2.5"
          >
            View sprint scope
          </a>
        </div>
        <button
          type="button"
          aria-label="Open navigation"
          className="relative grid size-9 shrink-0 place-items-center rounded-lg text-zinc-700 ring-1 ring-zinc-950/10 hover:bg-zinc-950/2.5 lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <span
            className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
            aria-hidden="true"
          />
          <Menu className="size-5 shrink-0" aria-hidden="true" />
        </button>
      </div>
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function MetricStrip() {
  return (
    <div className="@container rounded-lg border border-zinc-950/10 bg-white">
      <dl className="grid @2xl:grid-cols-4 @md:grid-cols-2" role="list">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border-t border-zinc-950/10 p-4 first:border-t-0 @md:[&:nth-child(-n+2)]:border-t-0 @2xl:border-t-0 @2xl:not-first:border-l"
          >
            <dt className="truncate text-base/7 text-zinc-500 sm:text-sm/6">
              {metric.label}
            </dt>
            <dd className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums sm:text-xl">
              {metric.value}
            </dd>
            <dd className="mt-1 truncate text-base/7 text-zinc-500 sm:text-sm/6">
              {metric.note}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[11fr_9fr] lg:items-center">
          <div className="min-w-0">
            <p className="font-mono text-sm/6 tracking-wide text-teal-700 uppercase">
              GTech SaaS demo sprint
            </p>
            <h1 className="mt-4 max-w-[20ch] text-5xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-6xl">
              Showcase SteadyPrep as a Supabase and Stripe SaaS.
            </h1>
            <p className="mt-6 max-w-[48ch] text-lg/8 text-pretty text-zinc-600">
              A no-payment demo that presents Supabase auth, per-student data,
              Stripe test-mode subscriptions, server-side Claude grading, credit
              enforcement, and Vercel deployment as one credible product story.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-base/6 font-medium text-white ring-1 ring-teal-600 hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:px-3 sm:py-2 sm:text-sm/6"
              >
                Run the demo flow
                <ArrowRight className="size-4 h-lh shrink-0" aria-hidden="true" />
              </a>
              <a
                href="#architecture"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-base/6 font-medium text-zinc-700 ring-1 ring-zinc-950/10 hover:bg-zinc-950/2.5 sm:px-3 sm:py-2 sm:text-sm/6"
              >
                Inspect architecture
                <ChevronRight className="size-4 h-lh shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="[--padding:--spacing(2)] [--radius:var(--radius-lg)] rounded-(--radius) bg-zinc-950 p-(--padding) shadow-xl ring-1 ring-zinc-950/10">
            <div className="rounded-[calc(var(--radius)-var(--padding))] bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base/7 font-medium text-zinc-950 sm:text-sm/6">
                    Student dashboard
                  </p>
                  <p className="mt-1 text-base/7 text-zinc-500 sm:text-sm/6">
                    Authenticated view with simulated billing and credit state.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-teal-50 py-1 pr-2 pl-1 text-sm/6 whitespace-nowrap text-teal-700 ring-1 ring-teal-600/15 sm:text-xs/5">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="size-4 h-lh shrink-0" aria-hidden="true" />
                    <span>Demo mode</span>
                  </span>
                </span>
              </div>
              <div className="mt-5">
                <MetricStrip />
              </div>
              <div className="mt-5 rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-950/5">
                <div className="flex items-center justify-between gap-4">
                  <p className="truncate text-base/7 font-medium text-zinc-950 sm:text-sm/6">
                    AI grading credits
                  </p>
                  <p className="text-base/7 text-zinc-600 tabular-nums sm:text-sm/6">
                    124 / 150
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white ring-1 ring-zinc-950/10">
                  <div className="h-2 w-[82%] rounded-full bg-teal-600" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {["FRQ rubric scored", "Webhook grant synced"].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-base/7 text-zinc-600 sm:text-sm/6">
                      <Check className="size-4 h-lh shrink-0 stroke-teal-600" aria-hidden="true" />
                      <span className="min-w-0">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoModeSection() {
  const [stage, setStage] = useState<DemoStage>("visitor");
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("idle");
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const isSignedIn = stage === "signed-in" || stage === "subscribed";
  const isSubscribed = stage === "subscribed";
  const isCheckoutLoading = checkoutStatus === "loading";
  const credits = isSubscribed ? 150 : isSignedIn ? 12 : 0;
  const supabaseProjectRef =
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF ?? "demo-project-ref";
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    `https://${supabaseProjectRef}.supabase.co`;
  const supabaseKeyLabel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? "Public key configured"
    : "Public key supplied";
  const stripeKeyLabel = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? "pk_test configured"
    : "pk_test supplied for demo";
  const visibleEvents = isSubscribed
    ? demoLedgerEvents
    : isSignedIn
      ? demoLedgerEvents.slice(0, 2)
      : ["Demo visitor can inspect the flow before signing in."];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeResult = params.get("stripe");
    let timeoutId: number | undefined;

    if (stripeResult === "success") {
      timeoutId = window.setTimeout(() => {
        setStage("subscribed");
        setCheckoutMessage("Stripe returned from a test Checkout Session.");
      }, 0);
    }

    if (stripeResult === "cancelled") {
      timeoutId = window.setTimeout(() => {
        setStage("signed-in");
        setCheckoutMessage("Stripe Checkout was cancelled before a test subscription completed.");
      }, 0);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  async function openStripeCheckout() {
    setCheckoutStatus("loading");
    setCheckoutMessage(null);

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerEmail: "demo.student@example.com" }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      url?: string;
    };

    if (!response.ok || !payload.url) {
      setCheckoutStatus("error");
      setCheckoutMessage(
        payload.error ??
          "Stripe Checkout is not configured for this deployment yet.",
      );
      return;
    }

    window.location.assign(payload.url);
  }

  function resetDemo() {
    setStage("visitor");
    setCheckoutStatus("idle");
    setCheckoutMessage(null);
  }

  return (
    <section id="demo" className="bg-zinc-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-start">
          <div className="min-w-0">
            <p className="font-mono text-sm/6 tracking-wide text-teal-700 uppercase">
              No-payment live demo
            </p>
            <h2 className="mt-3 max-w-[35ch] text-4xl font-semibold tracking-tight text-balance text-zinc-950">
              Click through Supabase and Stripe without enabling charges.
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg/8 text-pretty text-zinc-600">
              This demo creates a real Stripe-hosted Checkout Session from a
              server route using a test-mode key. The route rejects live keys, so
              no real card can be charged.
            </p>
            <div className="mt-5 max-w-xl rounded-lg bg-white p-4 ring-1 ring-zinc-950/10">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 shrink-0 stroke-teal-600" aria-hidden="true" />
                <h3 className="text-base/7 font-semibold text-zinc-950 sm:text-sm/6">
                  Stripe test card
                </h3>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {stripeTestCard.map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-sm/6 text-zinc-500">{label}</dt>
                    <dd className="mt-1 truncate font-mono text-base/7 text-zinc-950 sm:text-sm/6">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-sm/6 text-zinc-500">
                Test card only. It works with Stripe test mode and never moves real
                money.
              </p>
            </div>
            <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <button
                type="button"
                onClick={() => setStage("signed-in")}
                disabled={isSignedIn}
                className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-base/6 font-medium whitespace-nowrap text-zinc-700 ring-1 ring-zinc-950/10 hover:bg-zinc-950/2.5 disabled:opacity-50 sm:py-2 sm:text-sm/6"
              >
                <UserCheck className="size-4 h-lh shrink-0" aria-hidden="true" />
                Sign in student
              </button>
              <button
                type="button"
                onClick={openStripeCheckout}
                disabled={!isSignedIn || isSubscribed || isCheckoutLoading}
                className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2.5 text-base/6 font-medium whitespace-nowrap text-white ring-1 ring-teal-600 hover:bg-teal-700 disabled:opacity-50 sm:col-span-2 sm:py-2 sm:text-sm/6 lg:col-span-1 xl:col-span-2"
              >
                <CreditCard className="size-4 h-lh shrink-0" aria-hidden="true" />
                {isCheckoutLoading ? "Opening Checkout" : "Open Stripe Checkout"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage("subscribed");
                  setCheckoutMessage("Simulated checkout.session.completed webhook grant.");
                }}
                disabled={!isSignedIn || isSubscribed}
                className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-base/6 font-medium whitespace-nowrap text-zinc-700 ring-1 ring-zinc-950/10 hover:bg-zinc-950/2.5 disabled:opacity-50 sm:py-2 sm:text-sm/6"
              >
                <ReceiptText className="size-4 h-lh shrink-0" aria-hidden="true" />
                Simulate webhook
              </button>
              <button
                type="button"
                onClick={resetDemo}
                className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-base/6 font-medium whitespace-nowrap text-zinc-600 hover:bg-zinc-950/2.5 sm:py-2 sm:text-sm/6"
              >
                <RefreshCw className="size-4 h-lh shrink-0" aria-hidden="true" />
                Reset
              </button>
            </div>
            {checkoutMessage ? (
              <p
                className={classNames(
                  "mt-4 rounded-lg px-3 py-2 text-base/7 sm:text-sm/6",
                  checkoutStatus === "error"
                    ? "bg-red-50 text-red-700 ring-1 ring-red-600/15"
                    : "bg-teal-50 text-teal-700 ring-1 ring-teal-600/15",
                )}
              >
                {checkoutMessage}
              </p>
            ) : null}
          </div>

          <div className="grid min-w-0 gap-4">
            <div className="min-w-0 rounded-lg border border-zinc-950/10 bg-white">
              <dl className="grid md:grid-cols-3" role="list">
                {[
                  {
                    label: "Supabase auth",
                    value: isSignedIn ? "Signed in" : "Visitor",
                    note: isSignedIn ? "demo_student_42" : supabaseKeyLabel,
                  },
                  {
                    label: "Stripe subscription",
                    value: isSubscribed ? "Active" : "Test mode",
                    note: isSubscribed ? "checkout.session.completed" : stripeKeyLabel,
                  },
                  {
                    label: "Credits",
                    value: String(credits),
                    note: isSubscribed ? "Monthly grant applied" : "Server cap preview",
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="min-w-0 border-t border-zinc-950/10 p-4 first:border-t-0 md:border-t-0 md:not-first:border-l"
                  >
                    <dt className="truncate text-base/7 text-zinc-500 sm:text-sm/6">
                      {metric.label}
                    </dt>
                    <dd className="mt-2 truncate text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums sm:text-xl">
                      {metric.value}
                    </dd>
                    <dd className="mt-1 truncate text-base/7 text-zinc-500 sm:text-sm/6">
                      {metric.note}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <div className="min-w-0 rounded-lg border border-zinc-950/10 bg-white p-5">
                <h3 className="text-lg font-semibold text-zinc-950 sm:text-base">
                  Supabase demo records
                </h3>
                <p className="mt-1 truncate text-base/7 text-zinc-500 sm:text-sm/6">
                  {supabaseProjectRef} · {supabaseUrl}
                </p>
                <dl className="mt-4 grid gap-3">
                  {[
                    ["profiles", isSignedIn ? "Visible through RLS" : "Locked"],
                    ["attempts", isSignedIn ? "4 saved attempts" : "Requires auth"],
                    ["credit_ledger", isSubscribed ? "+150 test grant" : "No grant yet"],
                  ].map(([term, detail]) => (
                    <div key={term} className="flex items-center justify-between gap-4">
                      <dt className="font-mono text-base/7 text-teal-700 sm:text-sm/6">
                        {term}
                      </dt>
                      <dd className="truncate text-base/7 text-zinc-600 sm:text-sm/6">
                        {detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="min-w-0 rounded-lg border border-zinc-950/10 bg-white p-5">
                <h3 className="text-lg font-semibold text-zinc-950 sm:text-base">
                  Simulated Stripe event log
                </h3>
                <ul role="list" className="mt-4 grid gap-3">
                  {visibleEvents.map((event) => (
                    <li key={event} className="flex items-start gap-2 text-base/7 text-zinc-600 sm:text-sm/6">
                      <ReceiptText className="size-4 h-lh shrink-0 stroke-teal-600" aria-hidden="true" />
                      <span className="min-w-0">{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TabButton({
  tab,
  activeTab,
  setActiveTab,
}: {
  tab: Tab;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  const isActive = tab === activeTab;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={classNames(
        "shrink-0 rounded-lg px-3 py-2 text-base/7 font-medium sm:text-sm/6",
        isActive
          ? "bg-zinc-950/5 text-zinc-950"
          : "text-zinc-600 hover:bg-zinc-950/2.5 hover:text-zinc-950",
      )}
    >
      {tab}
    </button>
  );
}

function LaunchPlanPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {sprint.map((phase) => (
        <div key={phase.day} className="rounded-lg border border-zinc-950/10 bg-white p-4">
          <p className="text-base/7 text-teal-700 sm:text-sm/6">{phase.day}</p>
          <h3 className="mt-2 text-lg font-semibold text-balance text-zinc-950 sm:text-base">
            {phase.title}
          </h3>
          <ul role="list" className="mt-4 grid gap-2">
            {phase.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-base/7 text-zinc-600 sm:text-sm/6">
                <Check className="size-4 h-lh shrink-0 stroke-teal-600" aria-hidden="true" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ArchitecturePanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-[4fr_3fr]">
      <dl className="grid gap-4 sm:grid-cols-2">
        {architecture.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-lg border border-zinc-950/10 bg-white p-5">
              <dt className="flex items-start gap-3 text-base/7 font-medium text-zinc-950 sm:text-sm/6">
                <Icon className="size-4 h-lh shrink-0 stroke-teal-600" aria-hidden="true" />
                <span className="min-w-0">{item.title}</span>
              </dt>
              <dd className="mt-3 text-base/7 text-pretty text-zinc-600 sm:text-sm/6">
                {item.description}
              </dd>
            </div>
          );
        })}
      </dl>
      <div className="rounded-lg bg-zinc-50 p-5 ring-1 ring-zinc-950/5">
        <h3 className="text-lg font-semibold text-zinc-950 sm:text-base">
          Request path
        </h3>
        <div className="mt-5 grid gap-3">
          {[
            "Student submits an FRQ response.",
            "Server route checks auth, RLS, and remaining credits.",
            "Claude rubric grading runs with hidden API credentials.",
            "Attempt score and credit debit are committed together.",
          ].map((step, index) => (
            <div key={step} className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-sm/6 font-medium text-zinc-700 ring-1 ring-zinc-950/10 tabular-nums">
                {index + 1}
              </span>
              <p className="min-w-0 text-base/7 text-zinc-600 sm:text-sm/6">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentAppPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-[7fr_5fr]">
      <div className="rounded-lg border border-zinc-950/10 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950 sm:text-base">
              Practice session
            </h3>
            <p className="mt-1 text-base/7 text-zinc-500 sm:text-sm/6">
              Multiple choice and FRQ state saved per user.
            </p>
          </div>
          <span className="w-fit rounded-full bg-zinc-950/5 px-2 py-1 text-sm/6 text-zinc-700 sm:text-xs/5">
            Unit 3: Polynomial and rational functions
          </span>
        </div>
        <div className="mt-5 rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-950/5">
          <p className="text-base/7 font-medium text-zinc-950 sm:text-sm/6">
            FRQ 3B
          </p>
          <p className="mt-3 text-base/7 text-pretty text-zinc-600 sm:text-sm/6">
            Explain how the graph of a rational function reveals removable
            discontinuities and vertical asymptotes. Include interval behavior.
          </p>
          <textarea
            name="frq-response"
            aria-label="FRQ response"
            className="mt-4 min-h-28 w-full resize-none rounded-lg bg-white p-3 text-base/7 text-zinc-950 ring-1 ring-zinc-950/10 outline-hidden placeholder:text-zinc-400 focus:ring-2 focus:ring-teal-600 sm:text-sm/6 max-sm:text-base/7"
            placeholder="Write the student response here."
            defaultValue="The denominator tells us where x-values are excluded. A shared factor creates a hole, while a non-canceling zero in the denominator creates a vertical asymptote."
          />
        </div>
      </div>
      <div className="rounded-lg border border-zinc-950/10 bg-white p-5">
        <h3 className="text-lg font-semibold text-zinc-950 sm:text-base">
          AI rubric result
        </h3>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-base/7 text-zinc-500 sm:text-sm/6">Score</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-zinc-950 tabular-nums">
              4 / 5
            </p>
          </div>
          <p className="text-base/7 text-teal-700 tabular-nums sm:text-sm/6">
            -1 credit
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          {[
            "Correctly distinguishes holes from asymptotes.",
            "Needs a clearer link to interval notation.",
            "Saved to progress dashboard and review queue.",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-base/7 text-zinc-600 sm:text-sm/6">
              <Check className="size-4 h-lh shrink-0 stroke-teal-600" aria-hidden="true" />
              <span className="min-w-0">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoFlowPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {[
        {
          title: "Supabase sign-in",
          detail: "Creates a demo session and unlocks per-user records through the RLS story.",
        },
        {
          title: "Stripe test checkout",
          detail: "Simulates the $50 monthly subscription without creating a live payment intent.",
        },
        {
          title: "Webhook grant",
          detail: "Shows checkout.session.completed crediting the user ledger with 150 credits.",
        },
        {
          title: "AI grading debit",
          detail: "Shows the server-side grading route spending one credit after auth checks pass.",
        },
      ].map((item) => (
        <div key={item.title} className="rounded-lg border border-zinc-950/10 bg-white p-5">
          <h3 className="text-lg font-semibold text-zinc-950 sm:text-base">
            {item.title}
          </h3>
          <p className="mt-3 text-base/7 text-pretty text-zinc-600 sm:text-sm/6">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlanTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("Launch plan");

  return (
    <section id="plan" className="bg-zinc-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-[35ch] text-4xl font-semibold tracking-tight text-balance text-zinc-950">
              Fixed-scope build plan with production gates.
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg/8 text-pretty text-zinc-600">
              The prototype remains the functional spec; the sprint turns each feature
              into deployable SaaS infrastructure with security and billing checks.
            </p>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex w-max gap-1 rounded-lg bg-white p-1 ring-1 ring-zinc-950/10">
              {tabs.map((tab) => (
                <TabButton
                  key={tab}
                  tab={tab}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8">
          {activeTab === "Launch plan" ? <LaunchPlanPanel /> : null}
          {activeTab === "Architecture" ? <ArchitecturePanel /> : null}
          {activeTab === "Student app" ? <StudentAppPanel /> : null}
          {activeTab === "Demo flow" ? <DemoFlowPanel /> : null}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[5fr_7fr]">
          <div>
            <h2 className="max-w-[35ch] text-4xl font-semibold tracking-tight text-balance text-zinc-950">
              Data model and security posture.
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg/8 text-pretty text-zinc-600">
              Supabase owns identity and student records, Stripe owns entitlement
              events, and server routes own every credit-consuming AI action.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                { icon: ShieldCheck, label: "RLS on user-owned tables" },
                { icon: LockKeyhole, label: "Private API keys stay server-side" },
                { icon: Zap, label: "Webhook idempotency for monthly grants" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex items-start gap-3 text-base/7 text-zinc-600 sm:text-sm/6">
                    <Icon className="size-4 h-lh shrink-0 stroke-teal-600" aria-hidden="true" />
                    <span className="min-w-0">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="-mx-4 -my-2 overflow-x-auto whitespace-nowrap sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full px-4 py-2 align-middle sm:px-6 lg:px-8">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-950/10">
                  <tr>
                    <th className="py-3 pr-6 text-base/7 font-medium whitespace-nowrap text-zinc-950 sm:text-sm/6">
                      Table
                    </th>
                    <th className="py-3 text-base/7 font-medium whitespace-nowrap text-zinc-950 sm:text-sm/6">
                      Responsibility
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-950/10">
                  {schemaRows.map(([table, responsibility]) => (
                    <tr key={table}>
                      <td className="py-4 pr-6 font-mono text-base/7 text-teal-700 sm:text-sm/6">
                        {table}
                      </td>
                      <td className="py-4 text-base/7 text-zinc-600 sm:text-sm/6">
                        {responsibility}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StudentAppSection() {
  return (
    <section id="student-app" className="bg-zinc-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-start">
          <div>
            <h2 className="max-w-[35ch] text-4xl font-semibold tracking-tight text-balance text-zinc-950">
              Student-facing flows stay clear.
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg/8 text-pretty text-zinc-600">
              The UI makes subscription state, remaining credits, progress, and
              grading outcomes visible without turning the learning workflow into a
              billing workflow.
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Practice",
                text: "MCQ and FRQ attempts persist across sessions with review state.",
                icon: BookOpenCheck,
              },
              {
                title: "Progress",
                text: "Dashboard summaries show units mastered, accuracy, and rubric trends.",
                icon: Sparkles,
              },
              {
                title: "Billing",
                text: "Checkout and billing portal are one click away from account settings.",
                icon: CreditCard,
              },
              {
                title: "Credits",
                text: "Remaining AI grading credits are enforced server-side and reflected in UI.",
                icon: ShieldCheck,
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="rounded-lg border border-zinc-950/10 bg-white p-5">
                  <dt className="flex items-start gap-3 text-base/7 font-medium text-zinc-950 sm:text-sm/6">
                    <Icon className="size-4 h-lh shrink-0 stroke-teal-600" aria-hidden="true" />
                    <span className="min-w-0">{feature.title}</span>
                  </dt>
                  <dd className="mt-3 text-base/7 text-pretty text-zinc-600 sm:text-sm/6">
                    {feature.text}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}

function BillingSection() {
  return (
    <section id="billing" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-start">
          <div>
            <h2 className="max-w-[35ch] text-4xl font-semibold tracking-tight text-balance text-zinc-950">
              One paid tier, test-mode entitlement logic.
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg/8 text-pretty text-zinc-600">
              Stripe is presented in test mode for the demo while Supabase records
              product access and monthly credit grants in the implementation model.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-[4fr_5fr] md:grid-rows-[--spacing(6)_1fr]">
            <div className="rounded-lg border border-zinc-950/10 bg-white p-5 md:row-start-2">
              <h3 className="text-lg font-semibold text-zinc-950 sm:text-base">
                Launch readiness
              </h3>
              <ul role="list" className="mt-4 grid gap-3">
                {["Preview deploys", "Webhook replay tests", "RLS policy checks", "Env var audit"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2 text-base/7 text-zinc-600 sm:text-sm/6">
                      <Check className="size-4 h-lh shrink-0 stroke-teal-600" aria-hidden="true" />
                      <span className="min-w-0">{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="flex flex-col justify-between rounded-lg border border-zinc-950/10 bg-white p-6 shadow-lg ring-1 ring-zinc-950/5 md:row-span-full">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-zinc-950 sm:text-base">
                    SteadyPrep Plus
                  </h3>
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-sm/6 text-teal-700 ring-1 ring-teal-600/15 sm:text-xs/5">
                    Recommended
                  </span>
                </div>
                <p className="mt-5 text-5xl font-semibold tracking-tight text-zinc-950 tabular-nums">
                  $50
                  <span className="text-base/7 font-medium tracking-normal text-zinc-500 sm:text-sm/6">
                    /month
                  </span>
                </p>
                <p className="mt-4 text-base/7 text-pretty text-zinc-600 sm:text-sm/6">
                  Demo tier for AP Precalculus practice, progress dashboard, and
                  monthly AI grading credits. No live card charge is enabled.
                </p>
                <ul role="list" className="mt-6 grid gap-3">
                  {["150 monthly AI grading credits", "Billing portal self-service", "Server-enforced usage cap"].map(
                    (item) => (
                      <li key={item} className="flex items-start gap-2 text-base/7 text-zinc-600 sm:text-sm/6">
                        <Check className="size-4 h-lh shrink-0 stroke-teal-600" aria-hidden="true" />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="mt-8">
                <a
                  href="#plan"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base/6 font-medium text-zinc-700 ring-1 ring-zinc-950/10 hover:bg-zinc-950/2.5 sm:px-3 sm:py-2 sm:text-sm/6"
                >
                  Map this to implementation
                  <ArrowRight className="size-4 h-lh shrink-0" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SteadyPrepLaunch() {
  return (
    <main className="isolate min-h-dvh bg-white text-zinc-950">
      <Header />
      <Hero />
      <DemoModeSection />
      <PlanTabs />
      <ArchitectureSection />
      <StudentAppSection />
      <BillingSection />
    </main>
  );
}
