"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Scale,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  FileSearch,
  FileText,
  Lightbulb,
  Loader2,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";

type ActionType = "compare" | "related-work" | "gaps";

type ActionDefinition = {
  id: ActionType;
  title: string;
  description: string;
  eyebrow: string;
  icon: React.ReactNode;
  accent: "violet" | "blue" | "emerald";
};

const researchActions: ActionDefinition[] = [
  {
    id: "compare",
    title: "Compare Papers",
    description:
      "Analyze similarities, differences, methodologies, findings, and limitations across selected papers.",
    eyebrow: "Cross-paper analysis",
    icon: <Scale className="h-5 w-5" />,
    accent: "violet",
  },
  {
    id: "related-work",
    title: "Generate Related Work",
    description:
      "Create a connected literature review from the findings and contributions of your selected papers.",
    eyebrow: "Literature synthesis",
    icon: <BookOpen className="h-5 w-5" />,
    accent: "blue",
  },
  {
    id: "gaps",
    title: "Find Research Gaps",
    description:
      "Identify unanswered questions, limitations, unexplored directions, and potential project opportunities.",
    eyebrow: "Research discovery",
    icon: <Lightbulb className="h-5 w-5" />,
    accent: "emerald",
  },
];

export default function ResearchStudioPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [output, setOutput] = useState("");
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadPapers = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await PaperService.getPapers();

      setPapers(
        data.filter((paper: Paper) => paper.status === "ready")
      );
    } catch (err) {
      setPageError(
        err instanceof Error
          ? err.message
          : "Failed to load ready papers"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  function togglePaper(paperId: string) {
    setSelectedPaperIds((currentIds) => {
      if (currentIds.includes(paperId)) {
        return currentIds.filter((id) => id !== paperId);
      }

      return [...currentIds, paperId];
    });
  }

  function selectAllVisible() {
    setSelectedPaperIds((currentIds) => {
      const visibleIds = filteredPapers.map((paper) => paper.id);
      const allVisibleSelected = visibleIds.every((id) =>
        currentIds.includes(id)
      );

      if (allVisibleSelected) {
        return currentIds.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...currentIds, ...visibleIds]));
    });
  }

  async function runAction(action: ActionType) {
    if (selectedPaperIds.length < 2) {
      setActionError("Select at least two ready papers to continue.");
      return;
    }

    try {
      setGenerating(true);
      setActiveAction(action);
      setActionError("");
      setOutput("");

      if (action === "compare") {
        const data = await PaperService.comparePapers(selectedPaperIds);
        setOutput(data.comparison);
      }

      if (action === "related-work") {
        const data = await PaperService.generateRelatedWork(
          selectedPaperIds,
          topic
        );
        setOutput(data.related_work);
      }

      if (action === "gaps") {
        const data = await PaperService.findResearchGaps(
          selectedPaperIds,
          topic
        );
        setOutput(data.gaps);
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "The research action failed. Make sure the selected papers have AI profiles."
      );
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPapers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPapers]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

const filteredPapers = normalizedQuery
  ? papers.filter((paper) => {
      return (
        paper.filename.toLowerCase().includes(normalizedQuery) ||
        paper.title?.toLowerCase().includes(normalizedQuery) ||
        paper.authors?.toLowerCase().includes(normalizedQuery)
      );
    })
  : papers;

  const selectedPapers = papers.filter((paper) =>
  selectedPaperIds.includes(paper.id)
);

  const selectedAction = researchActions.find(
    (action) => action.id === activeAction
  );

  const allVisibleSelected =
    filteredPapers.length > 0 &&
    filteredPapers.every((paper) =>
      selectedPaperIds.includes(paper.id)
    );

  return (
    <div className="w-full space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 px-7 py-9 shadow-2xl shadow-black/20 md:px-10 md:py-11">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-blue-500/10 blur-[90px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-200">
              <Brain className="h-3.5 w-3.5" />
              Multi-paper intelligence
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              Turn a library of papers into research direction.
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
              Select multiple papers and use ResearchOS to compare their
              contributions, synthesize related work, and identify meaningful
              gaps for future research.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/papers">
              <Button
                variant="secondary"
                className="h-11 rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              >
                <FileText className="mr-2 h-4 w-4" />
                Open Library
              </Button>
            </Link>

            <Link href="/dashboard/upload">
              <Button className="h-11 rounded-xl bg-white px-5 text-black hover:bg-zinc-200">
                <Upload className="mr-2 h-4 w-4" />
                Upload Paper
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {pageError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {pageError}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <StudioStatCard
          label="Ready Papers"
          value={papers.length}
          description="Available for studio analysis"
          icon={<FileText className="h-5 w-5" />}
          accent="violet"
          loading={loading}
        />

        <StudioStatCard
          label="Selected"
          value={selectedPaperIds.length}
          description="Included in the current analysis"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
          loading={loading}
        />

        <StudioStatCard
          label="Minimum Required"
          value={2}
          description="Papers needed to run an action"
          icon={<Sparkles className="h-5 w-5" />}
          accent="blue"
          loading={false}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Step 1
                </p>

                <h2 className="mt-2 text-xl font-semibold text-white">
                  Select Papers
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Choose two or more ready papers for a multi-paper analysis.
                </p>
              </div>

              {papers.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={selectAllVisible}
                  className="rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                >
                  {allVisibleSelected
                    ? "Clear Visible"
                    : "Select Visible"}
                </Button>
              )}
            </div>

            {papers.length > 0 && (
              <div className="relative mt-5">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                <input
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search ready papers..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/10"
                />
              </div>
            )}
          </div>

          <div className="p-5">
            {loading && <PaperSelectionLoadingState />}

            {!loading && papers.length === 0 && (
              <EmptyPapersState />
            )}

            {!loading &&
              papers.length > 0 &&
              filteredPapers.length === 0 && (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <FileSearch className="h-7 w-7 text-zinc-400" />
                  </div>

                  <h3 className="mt-4 font-medium text-white">
                    No matching papers
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    Try a different title, filename, or author.
                  </p>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSearchQuery("")}
                    className="mt-5 rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                  >
                    Clear search
                  </Button>
                </div>
              )}

            {!loading && filteredPapers.length > 0 && (
              <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1">
                {filteredPapers.map((paper) => (
                  <PaperSelectionCard
                    key={paper.id}
                    paper={paper}
                    selected={selectedPaperIds.includes(paper.id)}
                    onToggle={() => togglePaper(paper.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Step 2
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Define the Research Context
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Add an optional topic to guide related-work and research-gap
                generation.
              </p>
            </div>

            <div className="p-6">
              <label
                htmlFor="research-topic"
                className="text-sm font-medium text-zinc-300"
              >
                Research topic
              </label>

              <input
                id="research-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Example: Autonomous racing, safe reinforcement learning..."
                className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/10"
              />

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Comparison works without a topic. Related work and gap analysis
                become more focused when one is provided.
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Current selection
              </p>

              <div className="mt-2 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">
                  {selectedPaperIds.length} paper
                  {selectedPaperIds.length === 1 ? "" : "s"} selected
                </h2>

                {selectedPaperIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedPaperIds([])}
                    className="text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="p-5">
              {selectedPapers.length === 0 ? (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 text-center">
                  <FileText className="h-6 w-6 text-zinc-600" />

                  <p className="mt-3 text-sm text-zinc-500">
                    Selected papers will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPapers.map((paper, index) => (
                    <div
                      key={paper.id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-400/10 text-xs font-semibold text-violet-300">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {paper.title || paper.filename}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-600">
                          {paper.filename}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePaper(paper.id)}
                        className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Step 3
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Choose a Research Task
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Select the type of multi-paper intelligence you want ResearchOS to
            generate.
          </p>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-3">
          {researchActions.map((action) => (
            <ResearchActionCard
              key={action.id}
              action={action}
              selectedCount={selectedPaperIds.length}
              generating={generating}
              activeAction={activeAction}
              onRun={() => runAction(action.id)}
            />
          ))}
        </div>
      </section>

      {actionError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-300">
          {actionError}
        </div>
      )}

      <section className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Research output
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              {selectedAction?.title || "Generated Insight"}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Your comparison, related work, or research-gap analysis will
              appear here.
            </p>
          </div>

          {output && selectedAction && (
            <Badge className="w-fit gap-1 border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/10">
              <CheckCircle2 className="h-3 w-3" />
              Generation complete
            </Badge>
          )}
        </div>

        <div className="min-h-[440px] p-6">
          {generating ? (
            <GeneratingState action={selectedAction} />
          ) : output ? (
            <MarkdownContent content={output} />
          ) : (
            <EmptyOutputState />
          )}
        </div>
      </section>
    </div>
  );
}

function PaperSelectionCard({
  paper,
  selected,
  onToggle,
}: {
  paper: Paper;
  selected: boolean;
  onToggle: () => void;
}) {
  const hasProfile = Boolean(paper.profile);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition duration-200 ${
        selected
          ? "border-violet-400/40 bg-violet-400/[0.09] shadow-lg shadow-violet-950/20"
          : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
          selected
            ? "border-violet-400/30 bg-violet-400/15 text-violet-200"
            : "border-white/10 bg-white/5 text-zinc-500 group-hover:text-zinc-300"
        }`}
      >
        {selected ? (
          <Check className="h-5 w-5" />
        ) : (
          <FileText className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-medium leading-6 text-zinc-100">
            {paper.title || paper.filename}
          </h3>

          {selected && (
            <Badge className="shrink-0 border border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/10">
              Selected
            </Badge>
          )}
        </div>

        <p className="mt-1 truncate text-xs text-zinc-600">
          {paper.filename}
        </p>

        {(paper.authors || paper.year) && (
          <p className="mt-2 truncate text-xs text-zinc-500">
            {[paper.authors, paper.year].filter(Boolean).join(" • ")}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs">
          {hasProfile ? (
            <span className="flex items-center gap-1 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Profile ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              Profile may be required
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ResearchActionCard({
  action,
  selectedCount,
  generating,
  activeAction,
  onRun,
}: {
  action: ActionDefinition;
  selectedCount: number;
  generating: boolean;
  activeAction: ActionType | null;
  onRun: () => void;
}) {
  const accentStyles = {
    violet: {
      icon: "border-violet-400/20 bg-violet-400/10 text-violet-300",
      hover: "hover:border-violet-400/30",
    },
    blue: {
      icon: "border-blue-400/20 bg-blue-400/10 text-blue-300",
      hover: "hover:border-blue-400/30",
    },
    emerald: {
      icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      hover: "hover:border-emerald-400/30",
    },
  };

  const styles = accentStyles[action.accent];
  const isGeneratingThisAction =
    generating && activeAction === action.id;

  return (
    <article
      className={`flex min-h-72 flex-col rounded-[22px] border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.045] ${styles.hover}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl border ${styles.icon}`}
      >
        {action.icon}
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
        {action.eyebrow}
      </p>

      <h3 className="mt-2 text-lg font-semibold text-white">
        {action.title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-zinc-500">
        {action.description}
      </p>

      <Button
        type="button"
        onClick={onRun}
        disabled={generating || selectedCount < 2}
        className="mt-6 h-11 w-full rounded-xl bg-white text-black hover:bg-zinc-200"
      >
        {isGeneratingThisAction ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            Run Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {selectedCount < 2 && (
        <p className="mt-2 text-center text-xs text-zinc-600">
          Select at least two papers
        </p>
      )}
    </article>
  );
}

function StudioStatCard({
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
  accent: "violet" | "emerald" | "blue";
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
    blue: {
      icon: "border-blue-400/20 bg-blue-400/10 text-blue-300",
      glow: "bg-blue-500/10",
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

function MarkdownContent({
  content,
}: {
  content: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-4 mt-8 text-2xl font-semibold tracking-tight text-white first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-8 text-xl font-semibold text-white first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-6 text-lg font-semibold text-zinc-100 first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-sm leading-7 text-zinc-300 last:mb-0 md:text-[15px]">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-white">
            {children}
          </strong>
        ),
        ul: ({ children }) => (
          <ul className="mb-5 ml-5 list-disc space-y-2 text-sm leading-7 text-zinc-300 md:text-[15px]">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-5 ml-5 list-decimal space-y-2 text-sm leading-7 text-zinc-300 md:text-[15px]">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="pl-1 marker:text-violet-300">
            {children}
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-5 border-l-2 border-violet-400/50 bg-violet-400/[0.05] px-4 py-3 text-zinc-300">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-violet-200">
            {children}
          </code>
        ),
        hr: () => <hr className="my-6 border-white/10" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function GeneratingState({
  action,
}: {
  action?: ActionDefinition;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-2xl" />

        <div className="relative rounded-2xl border border-violet-400/20 bg-violet-400/10 p-5 text-violet-300">
          <Loader2 className="h-9 w-9 animate-spin" />
        </div>
      </div>

      <h3 className="mt-6 text-xl font-semibold text-white">
        ResearchOS is generating your analysis
      </h3>

      <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
        {action
          ? `Analyzing the selected papers to create: ${action.title}.`
          : "Analyzing the selected papers and generating research insight."}
      </p>

      <div className="mt-8 w-full max-w-2xl space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`h-4 animate-pulse rounded bg-white/[0.07] ${
              index % 3 === 2 ? "w-3/4" : "w-full"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyOutputState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4 text-violet-300">
        <Sparkles className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        Your research insight will appear here
      </h3>

      <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
        Select at least two papers, choose a research task, and run the
        analysis to generate a structured result.
      </p>
    </div>
  );
}

function EmptyPapersState() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
        <FileText className="h-8 w-8 text-violet-300" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        No ready papers found
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Upload and process at least two papers before using Research Studio.
      </p>

      <Link href="/dashboard/upload" className="mt-6">
        <Button className="h-11 rounded-xl bg-white px-5 text-black hover:bg-zinc-200">
          <Upload className="mr-2 h-4 w-4" />
          Upload Paper
        </Button>
      </Link>
    </div>
  );
}

function PaperSelectionLoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"
        >
          <div className="h-11 w-11 animate-pulse rounded-xl bg-white/10" />

          <div className="flex-1">
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-white/5" />
            <div className="mt-4 h-3 w-1/4 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}