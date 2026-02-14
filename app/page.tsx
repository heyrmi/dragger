import Link from "next/link";
import { Cigarette, Users, Trophy, Bell } from "lucide-react";

const features = [
  {
    icon: Cigarette,
    title: "Track your drags",
    description:
      "Log when you had a cigarette or confirm you're still going strong. Simple, honest, no judgement.",
  },
  {
    icon: Users,
    title: "Bring your friends",
    description:
      "Invite your smoking buddies. See their streaks, cheer them on, and hold each other accountable.",
  },
  {
    icon: Trophy,
    title: "Climb the leaderboard",
    description:
      "Compete with friends on who can go the longest. A little competition never hurt anyone.",
  },
  {
    icon: Bell,
    title: "Get nudged",
    description:
      "Haven't logged in a while? Your friends can nudge you. Because they care.",
  },
];

const steps = [
  { step: "1", title: "Sign up", description: "Create your account in seconds." },
  {
    step: "2",
    title: "Log your first update",
    description: "Had a drag? No change? Just be honest.",
  },
  {
    step: "3",
    title: "Invite friends",
    description: "Share your invite link. It's better together.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <span className="font-heading text-lg font-bold tracking-tight text-text-primary">
          dragger
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center md:py-32">
        <h1 className="font-heading text-4xl font-bold tracking-tight md:text-6xl">
          Quit together.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-text-secondary leading-relaxed">
          Dragger helps friend groups track and reduce cigarette consumption.
          No pressure, no lectures, just honest tracking and a little friendly competition.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center rounded-sm bg-accent px-8 py-3 font-medium text-white hover:bg-accent-hover transition-colors active:scale-[0.98]"
          >
            Start tracking
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-sm border border-border px-8 py-3 font-medium text-text-primary hover:border-text-secondary transition-colors"
          >
            I have an account
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-center mb-12">
          How it works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-border font-mono text-sm font-bold text-accent">
                {s.step}
              </div>
              <h3 className="font-heading text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-sm border border-border bg-bg-card p-6"
            >
              <feature.icon size={24} className="text-accent mb-3" />
              <h3 className="font-heading text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight">
          Ready to see how long you can go?
        </h2>
        <p className="mt-4 text-text-secondary">
          Free. No ads. Just you, your friends, and a little accountability.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center rounded-sm bg-accent px-8 py-3 font-medium text-white hover:bg-accent-hover transition-colors active:scale-[0.98]"
        >
          Get started
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-text-secondary">
        <span className="font-heading font-bold text-text-primary">dragger</span>
        {" — "}Quit together.
      </footer>
    </div>
  );
}
