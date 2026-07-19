"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  FileSearch,
  FileText,
  Library,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";

type SortOption = "newest" | "oldest" | "title";
type FilterOption = "all" | "ready" | "processing" | "failed";

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const [paperToDelete, setPaperToDelete] = useState<Paper | null>(null);
  const [deletingPaperId, setDeletingPaperId] = useState<string | null>(
    null
  );

  const loadPapers = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const data = await PaperService.getPapers();
      setPapers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load papers"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPapers(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPapers]);

  useEffect(() => {
    const hasActivePaper = papers.some(
      (paper) =>
        paper.status === "queued" || paper.status === "processing"
    );

    if (!hasActivePaper) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadPapers(false);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [papers, loadPapers]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  async function deletePaper() {
    if (!paperToDelete || deletingPaperId) {
      return;
    }

    const paperId = paperToDelete.id;
    const paperName =
      paperToDelete.title || paperToDelete.filename;

    try {
      setDeletingPaperId(paperId);
      setError("");

      await PaperService.deletePaper(paperId);

      setPapers((currentPapers) =>
        currentPapers.filter((paper) => paper.id !== paperId)
      );

      setPaperToDelete(null);
      setSuccessMessage(`"${paperName}" was deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete paper"
      );
    } finally {
      setDeletingPaperId(null);
    }
  }

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

  const filteredPapers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = papers.filter((paper) => {
      const matchesSearch =
        !normalizedQuery ||
        paper.filename.toLowerCase().includes(normalizedQuery) ||
        paper.title?.toLowerCase().includes(normalizedQuery) ||
        paper.authors?.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "ready" && paper.status === "ready") ||
        (filterBy === "failed" && paper.status === "failed") ||
        (filterBy === "processing" &&
          (paper.status === "queued" ||
            paper.status === "processing"));

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((firstPaper, secondPaper) => {
      if (sortBy === "title") {
        const firstTitle = firstPaper.title || firstPaper.filename;
        const secondTitle = secondPaper.title || secondPaper.filename;

        return firstTitle.localeCompare(secondTitle);
      }

      const firstDate = new Date(firstPaper.uploaded_at).getTime();
      const secondDate = new Date(secondPaper.uploaded_at).getTime();

      return sortBy === "oldest"
        ? firstDate - secondDate
        : secondDate - firstDate;
    });
  }, [papers, searchQuery, sortBy, filterBy]);

  return (
    <>
      <div className="w-full space-y-7 pb-12">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 px-7 py-8 shadow-2xl shadow-black/20 md:px-9 md:py-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-blue-500/10 blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-200">
                <Library className="h-3.5 w-3.5" />
                Research Library
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                Your research, organized and ready.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                Browse uploaded papers, track processing status, and open
                each document inside its AI-powered research workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => loadPapers(false)}
                disabled={refreshing}
                className="h-11 rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>

              <Link href="/dashboard/upload">
                <Button className="h-11 rounded-xl bg-white px-5 text-black hover:bg-zinc-200">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Paper
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {successMessage && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {successMessage}
            </div>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="rounded-lg p-1 text-emerald-300/70 transition hover:bg-white/5 hover:text-emerald-200"
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
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

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Total Papers"
            value={papers.length}
            description="Documents in your library"
            icon={<FileText className="h-5 w-5" />}
            accent="violet"
            loading={loading}
          />

          <StatCard
            label="Ready"
            value={readyCount}
            description="Available for AI analysis"
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="emerald"
            loading={loading}
          />

          <StatCard
            label="Processing"
            value={processingCount}
            description="Currently being indexed"
            icon={<Clock3 className="h-5 w-5" />}
            accent="amber"
            loading={loading}
          />
        </section>

        <section className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Browse your collection
                </p>

                <h2 className="mt-2 text-xl font-semibold text-white">
                  Research Papers
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Processing papers refresh automatically every three
                  seconds.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 md:flex-row xl:w-auto">
                <div className="relative min-w-0 flex-1 xl:w-80">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                  <input
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search title, filename, or author..."
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/10"
                  />
                </div>

                <div className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                  <select
                    value={filterBy}
                    onChange={(event) =>
                      setFilterBy(
                        event.target.value as FilterOption
                      )
                    }
                    className="h-11 min-w-40 appearance-none rounded-xl border border-white/10 bg-zinc-900 pl-10 pr-8 text-sm text-zinc-200 outline-none transition focus:border-violet-400/40"
                  >
                    <option value="all">All statuses</option>
                    <option value="ready">Ready</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as SortOption)
                  }
                  className="h-11 min-w-36 rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none transition focus:border-violet-400/40"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5">
            {loading && <LibraryLoadingState />}

            {!loading && !error && papers.length === 0 && (
              <EmptyLibraryState />
            )}

            {!loading &&
              !error &&
              papers.length > 0 &&
              filteredPapers.length === 0 && (
                <NoResultsState
                  onReset={() => {
                    setSearchQuery("");
                    setFilterBy("all");
                    setSortBy("newest");
                  }}
                />
              )}

            {!loading && !error && filteredPapers.length > 0 && (
              <>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-zinc-500">
                    Showing{" "}
                    <span className="font-medium text-zinc-300">
                      {filteredPapers.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-zinc-300">
                      {papers.length}
                    </span>{" "}
                    papers
                  </p>

                  {processingCount > 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-300">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Live processing updates enabled
                    </div>
                  )}
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredPapers.map((paper) => (
                    <PaperCard
                      key={paper.id}
                      paper={paper}
                      deleting={deletingPaperId === paper.id}
                      onDelete={() => setPaperToDelete(paper)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {paperToDelete && (
        <DeletePaperDialog
          paper={paperToDelete}
          deleting={deletingPaperId === paperToDelete.id}
          onCancel={() => {
            if (!deletingPaperId) {
              setPaperToDelete(null);
            }
          }}
          onConfirm={deletePaper}
        />
      )}
    </>
  );
}

function PaperCard({
  paper,
  deleting,
  onDelete,
}: {
  paper: Paper;
  deleting: boolean;
  onDelete: () => void;
}) {
  const isReady = paper.status === "ready";
  const hasSummary = Boolean(paper.summary);
  const hasProfile = Boolean(paper.profile);

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-white/[0.045] hover:shadow-xl hover:shadow-black/20">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-violet-500/0 blur-3xl transition group-hover:bg-violet-500/10" />

      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <FileText className="h-5 w-5 text-violet-300" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-base font-medium leading-6 text-zinc-100">
                  {paper.title || paper.filename}
                </h3>

                <p className="mt-1.5 truncate text-sm text-zinc-500">
                  {paper.filename}
                </p>
              </div>

              <StatusBadge status={paper.status} />
            </div>

            {(paper.authors || paper.year) && (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                {paper.authors && (
                  <span className="max-w-full truncate">
                    {paper.authors}
                  </span>
                )}

                {paper.authors && paper.year && (
                  <span className="text-zinc-700">•</span>
                )}

                {paper.year && <span>{paper.year}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <FeatureStatus
            label="AI Summary"
            ready={hasSummary}
          />

          <FeatureStatus
            label="Paper Profile"
            ready={hasProfile}
          />
        </div>

        {paper.error_message && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm leading-6 text-red-300">
            {paper.error_message}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
              Uploaded
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              {formatDate(paper.uploaded_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-lg border border-red-400/20 bg-red-400/[0.07] text-red-300 hover:bg-red-400/15 hover:text-red-200"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>

            {isReady && (
              <Link href="/dashboard/research">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Studio
                </Button>
              </Link>
            )}

            {isReady ? (
              <Link href={`/dashboard/papers/${paper.id}`}>
                <Button
                  size="sm"
                  className="rounded-lg bg-white text-black hover:bg-zinc-200"
                >
                  Open Workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button size="sm" className="rounded-lg" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function DeletePaperDialog({
  paper,
  deleting,
  onCancel,
  onConfirm,
}: {
  paper: Paper;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-paper-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !deleting) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-300">
              <Trash2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-red-300/70">
                Permanent action
              </p>

              <h2
                id="delete-paper-title"
                className="mt-2 text-xl font-semibold text-white"
              >
                Delete this paper?
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close delete dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm leading-6 text-zinc-400">
            This will permanently remove the paper, its uploaded PDF,
            database chunks, and indexed Qdrant vectors.
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />

              <div className="min-w-0">
                <p className="line-clamp-2 font-medium text-zinc-100">
                  {paper.title || paper.filename}
                </p>

                <p className="mt-1 truncate text-sm text-zinc-600">
                  {paper.filename}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm font-medium text-red-300">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-black/20 p-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={deleting}
            className="h-11 rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="h-11 rounded-xl bg-red-500 px-5 text-white hover:bg-red-400"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureStatus({
  label,
  ready,
}: {
  label: string;
  ready: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-2">
        {ready ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        ) : (
          <Sparkles className="h-4 w-4 text-zinc-600" />
        )}

        <span className="text-sm font-medium text-zinc-300">
          {label}
        </span>
      </div>

      <p
        className={`mt-1.5 text-xs ${
          ready ? "text-emerald-300/80" : "text-zinc-600"
        }`}
      >
        {ready ? "Generated and ready" : "Not generated yet"}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  icon,
  accent,
  loading,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  accent: "violet" | "emerald" | "amber";
  loading: boolean;
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
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-zinc-950/80 p-6 shadow-lg shadow-black/10">
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl ${styles.glow}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">
            {label}
          </p>

          {loading ? (
            <div className="mt-3 h-10 w-16 animate-pulse rounded-xl bg-white/10" />
          ) : (
            <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
              {value}
            </p>
          )}
        </div>

        <div className={`rounded-xl border p-3 ${styles.icon}`}>
          {icon}
        </div>
      </div>

      <p className="relative mt-5 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Paper["status"];
}) {
  if (status === "ready") {
    return (
      <Badge className="gap-1 border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/10">
        <CheckCircle2 className="h-3 w-3" />
        Ready
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <Badge className="border border-red-400/20 bg-red-400/10 text-red-300 hover:bg-red-400/10">
        Failed
      </Badge>
    );
  }

  return (
    <Badge className="gap-1 border border-amber-400/20 bg-amber-400/10 text-amber-300 hover:bg-amber-400/10">
      <Loader2 className="h-3 w-3 animate-spin" />
      {status === "queued" ? "Queued" : "Processing"}
    </Badge>
  );
}

function LibraryLoadingState() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5"
        >
          <div className="flex gap-4">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-white/10" />

            <div className="flex-1">
              <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-white/5" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="h-16 animate-pulse rounded-xl bg-white/5" />
            <div className="h-16 animate-pulse rounded-xl bg-white/5" />
          </div>

          <div className="mt-5 h-10 animate-pulse rounded-xl bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function EmptyLibraryState() {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
        <FileText className="h-8 w-8 text-violet-300" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-white">
        Your research library is empty
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Upload a PDF to generate summaries, ask questions, compare findings,
        and discover research gaps.
      </p>

      <Link href="/dashboard/upload" className="mt-6">
        <Button className="h-11 rounded-xl bg-white px-5 text-black hover:bg-zinc-200">
          <Upload className="mr-2 h-4 w-4" />
          Upload your first paper
        </Button>
      </Link>
    </div>
  );
}

function NoResultsState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <FileSearch className="h-7 w-7 text-zinc-400" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-white">
        No matching papers
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
        Try a different search phrase or remove the current filters.
      </p>

      <Button
        variant="secondary"
        onClick={onReset}
        className="mt-5 rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
      >
        Reset filters
      </Button>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}