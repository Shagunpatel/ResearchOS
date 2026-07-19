"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Complete all fields before creating your account.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      router.push("/login?registered=true");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-violet-500/15 blur-[130px]" />
      <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[140px]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
              <Sparkles className="h-6 w-6 text-violet-300" />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                ResearchOS
              </h1>

              <p className="text-sm text-zinc-500">
                AI Research Assistant
              </p>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-200">
              <Brain className="h-3.5 w-3.5" />
              Build your research workspace
            </div>

            <h2 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-[-0.045em] xl:text-6xl">
              Turn papers into progress.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              Create a private research library and use AI to
              understand papers, synthesize literature, and uncover
              future research directions.
            </p>

            <div className="mt-10 space-y-4">
              <FeatureRow text="Upload and process academic PDFs" />
              <FeatureRow text="Chat with your research library" />
              <FeatureRow text="Generate comparisons, gaps, and related work" />
            </div>
          </div>

          <p className="text-sm text-zinc-600">
            ResearchOS v1
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
                <Sparkles className="h-5 w-5 text-violet-300" />
              </div>

              <div>
                <p className="font-semibold">ResearchOS</p>
                <p className="text-xs text-zinc-500">
                  AI Research Assistant
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Get started
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
                Create your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Start building your AI-powered research library.
              </p>

              {error && (
                <div className="mt-6 flex items-start justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-300">
                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="rounded-lg p-1 text-red-300/70 transition hover:bg-white/5 hover:text-red-200"
                    aria-label="Dismiss error"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >
                <div>
                  <label
                    htmlFor="full-name"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Full name
                  </label>

                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                    <input
                      id="full-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      placeholder="Your full name"
                      disabled={submitting}
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Email address
                  </label>

                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      disabled={submitting}
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>

                  <div className="relative mt-2">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="At least 8 characters"
                      disabled={submitting}
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-10 pr-12 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-zinc-600">
                    Use at least 8 characters.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full rounded-xl bg-white text-black hover:bg-zinc-200"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-7 border-t border-white/10 pt-6 text-center">
                <p className="text-sm text-zinc-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-violet-300 transition hover:text-violet-200"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-zinc-300">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
      </div>

      <span className="text-sm">{text}</span>
    </div>
  );
}