"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GoogleIcon } from "@/components/ui/google-icon";

interface Inviter {
  id: string;
  name: string;
  image: string | null;
}

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const { data: session } = useSession();
  const [inviter, setInviter] = useState<Inviter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state for new users
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${code}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.inviter) {
          setInviter(data.inviter);
        }
      })
      .finally(() => setLoading(false));
  }, [code]);

  // If logged in, auto-send friend request
  useEffect(() => {
    if (session && inviter) {
      fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: inviter.id }),
      }).then(() => {
        router.push("/dashboard/friends");
      });
    }
  }, [session, inviter, router]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error: authError } = await signUp.email({
      name,
      email,
      password,
      callbackURL: `/invite/${code}`,
    });

    if (authError) {
      setError(authError.message || "Hmm, that didn't work. Try again?");
      setSubmitting(false);
    }
    // After signup, the useEffect above will handle the friend request
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (session && inviter) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-secondary">Sending friend request to {inviter.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {inviter ? (
            <>
              <div className="mb-3 inline-flex items-center gap-2 rounded-sm border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-accent">
                {inviter.name} invited you to Dragger
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight">
                Join Dragger
              </h1>
              <p className="mt-2 text-text-secondary">
                Create an account and start tracking together
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-3xl font-bold tracking-tight">
                Welcome to Dragger
              </h1>
              <p className="mt-2 text-text-secondary">
                This invite link is no longer valid, but you can still sign up.
              </p>
            </>
          )}
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              onClick={() =>
                signIn.social({
                  provider: "google",
                  callbackURL: `/invite/${code}`,
                })
              }
            >
              <GoogleIcon />
              Sign up with Google
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-text-secondary">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <Input
                id="name"
                label="Name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button type="submit" disabled={submitting} className="mt-2 w-full">
                {submitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </div>
        </Card>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
