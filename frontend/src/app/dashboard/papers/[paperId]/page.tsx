"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function PaperDetailsPage() {
  const params = useParams();
  const paperId = params.paperId as string;

  const [paper, setPaper] = useState<Paper | null>(null);
  const [summary, setSummary] = useState("");
  const [profile, setProfile] = useState("");
  const [chatQuestion, setChatQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const [pageError, setPageError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [chatError, setChatError] = useState("");

  const loadPaper = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await PaperService.getPaper(paperId);

      setPaper(data);
      setSummary(data.summary || "");
      setProfile(data.profile?.profile_text || "");
    } catch (err) {
      setPageError(
        err instanceof Error ? err.message : "Failed to load paper"
      );
    } finally {
      setLoading(false);
    }
  }, [paperId]);

  async function generateSummary() {
    if (!paper || paper.status !== "ready") {
      return;
    }

    try {
      setSummaryLoading(true);
      setSummaryError("");

      const data = await PaperService.summarizePaper(paperId);
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(
        err instanceof Error ? err.message : "Failed to generate summary"
      );
    } finally {
      setSummaryLoading(false);
    }
  }

  async function generateProfile() {
  if (!paper || paper.status !== "ready") {
    return;
  }

  try {
    setProfileLoading(true);
    setProfileError("");

    const data = await PaperService.generateProfile(paperId);

    const generatedProfile =
      data.profile_text ||
      data.profile?.profile_text ||
      "";

    if (!generatedProfile) {
      throw new Error("The API did not return profile text.");
    }

    setProfile(generatedProfile);
  } catch (err) {
    setProfile("");
    setProfileError(
      err instanceof Error
        ? err.message
        : "Failed to generate profile"
    );
  } finally {
    setProfileLoading(false);
  }
}

  async function askQuestion() {
    const question = chatQuestion.trim();

    if (!question || chatLoading || paper?.status !== "ready") {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);
    setChatQuestion("");
    setChatError("");

    try {
      setChatLoading(true);

      const data = await PaperService.askQuestion(question);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (err) {
      setChatError(
        err instanceof Error ? err.message : "Failed to answer question"
      );
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadPaper();
  }, 0);

  return () => window.clearTimeout(timeoutId);
}, [loadPaper]);

  if (loading) {
    return <WorkspaceLoadingState />;
  }

  if (pageError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-[24px] border border-red-500/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-xl font-semibold text-white">
            Unable to open workspace
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-300">
            {pageError}
          </p>

          <Link href="/dashboard/papers" className="mt-6 inline-block">
            <Button
              variant="secondary"
              className="rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-zinc-400">
        Paper not found.
      </div>
    );
  }

  const isReady = paper.status === "ready";

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard/papers">
          <Button
            variant="secondary"
            className="rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </Link>

        <Link href="/dashboard/research">
          <Button
            variant="secondary"
            className="rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15"
          >
            <Brain className="mr-2 h-4 w-4" />
            Research Studio
          </Button>
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 px-7 py-8 shadow-2xl shadow-black/20 md:px-10 md:py-10">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-blue-500/10 blur-[90px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative">
          <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Research Workspace
                </div>

                <PaperStatus status={paper.status} />
              </div>

              <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.035em] text-white md:text-4xl xl:text-5xl">
                {paper.title || paper.filename}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-400">
                {paper.authors && (
                  <>
                    <span>{paper.authors}</span>
                    <span className="text-zinc-700">•</span>
                  </>
                )}

                {paper.year && (
                  <>
                    <span>{paper.year}</span>
                    <span className="text-zinc-700">•</span>
                  </>
                )}

                <span>{paper.filename}</span>
                <span className="text-zinc-700">•</span>
                <span>{formatDate(paper.uploaded_at)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={generateSummary}
                disabled={summaryLoading || !isReady}
                className="h-11 rounded-xl bg-white px-5 text-black hover:bg-zinc-200"
              >
                {summaryLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}

                {summary
                  ? "Regenerate Summary"
                  : "Generate Summary"}
              </Button>

              <Button
                onClick={generateProfile}
                disabled={profileLoading || !isReady}
                variant="secondary"
                className="h-11 rounded-xl border border-white/10 bg-white/5 px-5 text-zinc-200 hover:bg-white/10"
              >
                {profileLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="mr-2 h-4 w-4" />
                )}

                {profile
                  ? "Regenerate Profile"
                  : "Generate Profile"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {!isReady && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" />

          This paper is still being processed. AI actions will become available
          when indexing is complete.
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <WorkspaceCard
          icon={<FileText className="h-5 w-5" />}
          title="AI Summary"
          eyebrow="Paper overview"
          description="A structured explanation of the paper’s purpose, approach, findings, and conclusions."
          accent="violet"
          action={
            !summary ? (
              <Button
                onClick={generateSummary}
                disabled={summaryLoading || !isReady}
                size="sm"
                className="rounded-lg bg-white text-black hover:bg-zinc-200"
              >
                {summaryLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            ) : undefined
          }
        >
          {summaryError && (
            <InlineError message={summaryError} />
          )}

          {summaryLoading && !summary ? (
            <ContentLoadingState lines={8} />
          ) : summary ? (
            <MarkdownContent content={summary} />
          ) : (
            <EmptyContentState
              icon={<FileText className="h-7 w-7" />}
              title="No summary generated yet"
              description="Generate a concise AI overview of this paper before reading it in detail."
            />
          )}
        </WorkspaceCard>

        <WorkspaceCard
          icon={<Brain className="h-5 w-5" />}
          title="Paper Profile"
          eyebrow="Research intelligence"
          description="Problem, methodology, datasets, findings, limitations, and future research directions."
          accent="emerald"
          action={
            !profile ? (
              <Button
                onClick={generateProfile}
                disabled={profileLoading || !isReady}
                size="sm"
                variant="secondary"
                className="rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              >
                {profileLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            ) : undefined
          }
        >
          {profileError && (
            <InlineError message={profileError} />
          )}

          {profileLoading && !profile ? (
            <ContentLoadingState lines={7} />
          ) : profile ? (
            <MarkdownContent content={profile} />
          ) : (
            <EmptyContentState
              icon={<Brain className="h-7 w-7" />}
              title="No profile generated yet"
              description="Create a structured research profile to understand the paper at a glance."
            />
          )}
        </WorkspaceCard>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-violet-400/20 bg-violet-400/10 p-3 text-violet-300">
              <MessageSquare className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                AI conversation
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Ask this paper
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Ask questions about concepts, methods, results, or limitations.
              </p>
            </div>
          </div>

          <div className="text-xs text-zinc-600">
            Answers are generated from your indexed research library.
          </div>
        </div>

        <div className="min-h-[430px] p-5 md:p-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[310px] flex-col items-center justify-center text-center">
              <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4 text-violet-300">
                <MessageSquare className="h-8 w-8" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                Start a conversation with your research
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                Ask ResearchOS to explain the central problem, summarize the
                methodology, interpret the results, or identify limitations.
              </p>

              <div className="mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
                {[
                  "What problem does this paper solve?",
                  "Explain the methodology simply.",
                  "What are the main limitations?",
                  "What future work does it suggest?",
                ].map((question) => (
                  <button
                    key={question}
                    type="button"
                    disabled={!isReady}
                    onClick={() => setChatQuestion(question)}
                    className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-zinc-400 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}

              {chatLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.035] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      ResearchOS is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-black/20 p-5">
          {chatError && (
            <div className="mb-4">
              <InlineError message={chatError} />
            </div>
          )}

          <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-2 transition focus-within:border-violet-400/40 focus-within:ring-2 focus-within:ring-violet-400/10">
            <textarea
              value={chatQuestion}
              onChange={(event) => setChatQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  askQuestion();
                }
              }}
              disabled={!isReady || chatLoading}
              placeholder={
                isReady
                  ? "Ask a question about this paper..."
                  : "Waiting for paper processing to finish..."
              }
              className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed"
            />

            <Button
              onClick={askQuestion}
              disabled={
                !chatQuestion.trim() ||
                chatLoading ||
                !isReady
              }
              className="h-11 w-11 shrink-0 rounded-xl bg-white p-0 text-black hover:bg-zinc-200"
            >
              {chatLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="mt-2 px-1 text-xs text-zinc-600">
            Press Enter to send. Use Shift + Enter for a new line.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[24px] border border-violet-400/20 bg-violet-400/[0.06] p-6 md:p-8">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
              <Sparkles className="h-4 w-4" />
              Continue your research
            </div>

            <h2 className="mt-3 text-2xl font-semibold text-white">
              Connect this paper with the rest of your library.
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Compare findings, generate related work, and discover research
              gaps using Research Studio.
            </p>
          </div>

          <Link href="/dashboard/research">
            <Button className="h-11 rounded-xl bg-white px-5 text-black hover:bg-zinc-200">
              Open Research Studio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function WorkspaceCard({
  icon,
  title,
  eyebrow,
  description,
  accent,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  eyebrow: string;
  description: string;
  accent: "violet" | "emerald";
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const accentStyles = {
    violet:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
    emerald:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <article className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-xl border p-3 ${accentStyles[accent]}`}
          >
            {icon}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              {title}
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
              {description}
            </p>
          </div>
        </div>

        {action}
      </div>

      <div className="min-h-72 p-6">{children}</div>
    </article>
  );
}

function ChatBubble({
  message,
}: {
  message: ChatMessage;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "justify-end" : ""
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
          <Sparkles className="h-4 w-4" />
        </div>
      )}

      <div
        className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-7 ${
          isUser
            ? "rounded-tr-sm bg-white text-black"
            : "rounded-tl-sm border border-white/10 bg-white/[0.035] text-zinc-300"
        }`}
      >
        <div className="whitespace-pre-wrap">
          {message.content}
        </div>
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

function EmptyContentState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-500">
        {icon}
      </div>

      <h3 className="mt-4 font-medium text-zinc-200">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function ContentLoadingState({
  lines,
}: {
  lines: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 animate-pulse rounded bg-white/[0.07] ${
            index % 3 === 2 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

function InlineError({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm leading-6 text-red-300">
      {message}
    </div>
  );
}

function PaperStatus({
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
      <Clock3 className="h-3 w-3" />
      {status === "queued" ? "Queued" : "Processing"}
    </Badge>
  );
}

function WorkspaceLoadingState() {
  return (
    <div className="w-full space-y-6 pb-12">
      <div className="h-11 w-40 animate-pulse rounded-xl bg-white/[0.06]" />

      <div className="h-72 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.035]" />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="h-96 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.035]" />
        <div className="h-96 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.035]" />
      </div>

      <div className="h-[540px] animate-pulse rounded-[24px] border border-white/10 bg-white/[0.035]" />
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
          <h1 className="mb-4 mt-7 text-2xl font-semibold tracking-tight text-white first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-7 text-xl font-semibold text-white first:mt-0">
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}