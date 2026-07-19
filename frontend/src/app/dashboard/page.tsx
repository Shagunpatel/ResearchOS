"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  FileText,
  Library,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";

export default function DashboardPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPapers() {
      try {
        setLoading(true);
        setError("");

        const data = await PaperService.getPapers();
        setPapers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPapers();
  }, []);

  const readyCount = useMemo(
    () => papers.filter((paper) => paper.status === "ready").length,
    [papers]
  );

  const processingCount = useMemo(
    () =>
      papers.filter(
        (paper) =>
          paper.status === "queued" || paper.status === "processing"
      ).length,
    [papers]
  );

  const recentPapers = useMemo(() => {
    return [...papers]
      .sort(
        (firstPaper, secondPaper) =>
          new Date(secondPaper.uploaded_at).getTime() -
          new Date(firstPaper.uploaded_at).getTime()
      )
      .slice(0, 4);
  }, [papers]);

  return (
    <div className="w-full space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 px-7 py-9 shadow-2xl shadow-black/20 md:px-10 md:py-12">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-blue-500/10 blur-[90px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative flex flex-col justify-between gap-10 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              AI Research Intelligence
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl xl:text-6xl">
              Turn research papers into clear, useful insight.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
              Upload papers, ask questions, compare findings, generate related
              work, and uncover research gaps from one intelligent workspace.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/dashboard/upload">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-white px-5 text-black hover:bg-zinc-200"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Paper
              </Button>
            </Link>

            <Link href="/dashboard/research">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 rounded-xl border border-white/10 bg-white/5 px-5 text-white hover:bg-white/10"
              >
                <Brain className="mr-2 h-4 w-4" />
                Research Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Papers"
          value={papers.length}
          description="Documents in your research library"
          icon={<FileText className="h-5 w-5" />}
          loading={loading}
          accent="violet"
        />

        <StatCard
          label="Ready"
          value={readyCount}
          description="Available for summaries and analysis"
          icon={<CheckCircle2 className="h-5 w-5" />}
          loading={loading}
          accent="emerald"
        />

        <StatCard
          label="Processing"
          value={processingCount}
          description="Currently being indexed"
          icon={<Clock3 className="h-5 w-5" />}
          loading={loading}
          accent="amber"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Continue working
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Recent Papers
              </h2>
            </div>

            <Link href="/dashboard/papers">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              >
                View Library
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="p-5">
            {loading && (
              <div className="flex min-h-60 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />
              </div>
            )}

            {!loading && recentPapers.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <BookOpen className="h-7 w-7 text-zinc-400" />
                </div>

                <h3 className="mt-5 text-lg font-medium text-white">
                  Your library is empty
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                  Upload your first paper to begin generating summaries,
                  profiles, comparisons, and research insights.
                </p>

                <Link href="/dashboard/upload" className="mt-5">
                  <Button className="rounded-xl">Upload your first paper</Button>
                </Link>
              </div>
            )}

            {!loading && recentPapers.length > 0 && (
              <div className="space-y-3">
                {recentPapers.map((paper) => (
                  <RecentPaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-zinc-950/80 p-6 shadow-xl shadow-black/10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Start working
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Quick Actions
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Jump directly into the most important ResearchOS workflows.
          </p>

          <div className="mt-6 space-y-3">
            <QuickAction
              href="/dashboard/upload"
              title="Upload a Paper"
              description="Add a PDF and process it with AI."
              icon={<Upload className="h-5 w-5" />}
            />

            <QuickAction
              href="/dashboard/papers"
              title="Browse Library"
              description="Open your papers and continue your research."
              icon={<Library className="h-5 w-5" />}
            />

            <QuickAction
              href="/dashboard/research"
              title="Research Studio"
              description="Compare papers and discover new research directions."
              icon={<Brain className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon,
  loading,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
  accent: "violet" | "emerald" | "amber";
}) {
  const accentStyles = {
    violet: {
      icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
      glow: "bg-violet-500/10",
    },
    emerald: {
      icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      glow: "bg-emerald-500/10",
    },
    amber: {
      icon: "border-amber-400/20 bg-amber-400/10 text-amber-300",
      glow: "bg-amber-500/10",
    },
  };

  const styles = accentStyles[accent];

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-zinc-950/80 p-6 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-white/20">
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl ${styles.glow}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">{label}</p>

          {loading ? (
            <div className="mt-4 h-11 w-20 animate-pulse rounded-xl bg-white/10" />
          ) : (
            <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
              {value}
            </p>
          )}
        </div>

        <div className={`rounded-xl border p-3 ${styles.icon}`}>{icon}</div>
      </div>

      <p className="relative mt-5 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function RecentPaperCard({ paper }: { paper: Paper }) {
  const isReady = paper.status === "ready";

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition duration-200 hover:border-white/20 hover:bg-white/[0.05] sm:flex-row sm:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <FileText className="h-5 w-5 text-zinc-400" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-zinc-100">
          {paper.title || paper.filename}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span>{formatDate(paper.uploaded_at)}</span>
          <span className="text-zinc-700">•</span>
          <span className="max-w-[280px] truncate">{paper.filename}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <PaperStatus status={paper.status} />

        {isReady ? (
          <Link href={`/dashboard/papers/${paper.id}`}>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
            >
              Open
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="rounded-lg"
            disabled
          >
            Processing
          </Button>
        )}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition duration-200 hover:border-violet-400/30 hover:bg-violet-400/[0.06]"
    >
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-400 transition group-hover:border-violet-400/20 group-hover:bg-violet-400/10 group-hover:text-violet-300">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-zinc-100">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-zinc-500">{description}</p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition duration-200 group-hover:translate-x-1 group-hover:text-violet-300" />
    </Link>
  );
}

function PaperStatus({ status }: { status: Paper["status"] }) {
  if (status === "ready") {
    return (
      <Badge className="gap-1 border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/10">
        <CheckCircle2 className="h-3 w-3" />
        Ready
      </Badge>
    );
  }

  if (status === "failed") {
    return <Badge variant="destructive">Failed</Badge>;
  }

  return (
    <Badge
      variant="secondary"
      className="gap-1 border border-amber-400/20 bg-amber-400/10 text-amber-300"
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      {status === "queued" ? "Queued" : "Processing"}
    </Badge>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}