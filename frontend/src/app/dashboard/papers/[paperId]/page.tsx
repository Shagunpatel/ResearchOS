"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Brain, FileText, MessageSquare, Sparkles } from "lucide-react";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";

export default function PaperDetailsPage() {
  const params = useParams();
  const paperId = params.paperId as string;

  const [paper, setPaper] = useState<Paper | null>(null);
  const [summary, setSummary] = useState("");
  const [profile, setProfile] = useState("");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPaper() {
    try {
      setLoading(true);
      const data = await PaperService.getPaper(paperId);
      setPaper(data);
      setSummary(data.summary || "");
      setProfile(data.profile?.profile_text || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load paper");
    } finally {
      setLoading(false);
    }
  }

  async function generateSummary() {
    try {
      setSummaryLoading(true);
      const data = await PaperService.summarizePaper(paperId);
      setSummary(data.summary);
    } catch {
      alert("Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function generateProfile() {
    try {
      setProfileLoading(true);
      const data = await PaperService.generateProfile(paperId);
      setProfile(data.profile_text || JSON.stringify(data, null, 2));
    } catch {
      alert("Failed to generate profile");
    } finally {
      setProfileLoading(false);
    }
  }

  async function askQuestion() {
    if (!chatQuestion.trim()) return;

    try {
      setChatLoading(true);
      const data = await PaperService.askQuestion(chatQuestion);
      setChatAnswer(data.answer);
    } catch {
      alert("Failed to ask question");
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    loadPaper();
  }, [paperId]);

  if (loading) return <div className="text-zinc-400">Loading workspace...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!paper) return <div className="text-zinc-400">Paper not found.</div>;

  return (
    <div className="max-w-5xl">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm text-zinc-400">Research Workspace</p>

        <h1 className="mt-2 text-3xl font-bold">
          {paper.title || paper.filename}
        </h1>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-400">
          <span>{paper.filename}</span>
          <span>•</span>
          <span>Status: {paper.status}</span>
          <span>•</span>
          <span>{new Date(paper.uploaded_at).toLocaleString()}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={generateSummary}
            disabled={summaryLoading || paper.status !== "ready"}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {summaryLoading ? "Generating..." : "Generate Summary"}
          </button>

          <button
            onClick={generateProfile}
            disabled={profileLoading || paper.status !== "ready"}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:opacity-50"
          >
            {profileLoading ? "Generating..." : "Generate Profile"}
          </button>

          <Link
            href="/dashboard/research"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
          >
            Open Research Studio
          </Link>
        </div>
      </section>

      <WorkspaceSection
        icon={<FileText className="h-5 w-5" />}
        title="AI Summary"
        description="A structured overview of the paper."
      >
        <div className="whitespace-pre-wrap rounded-xl bg-black p-5 text-sm leading-7 text-zinc-200">
          {summary || "No summary yet. Click Generate Summary above."}
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        icon={<MessageSquare className="h-5 w-5" />}
        title="Ask ResearchOS"
        description="Ask questions about your uploaded research library."
      >
        <textarea
          value={chatQuestion}
          onChange={(e) => setChatQuestion(e.target.value)}
          placeholder="Example: What problem does this paper solve?"
          className="min-h-28 w-full rounded-xl border border-zinc-700 bg-black p-4 text-sm text-white outline-none"
        />

        <button
          onClick={askQuestion}
          disabled={chatLoading}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {chatLoading ? "Thinking..." : "Ask"}
        </button>

        {chatAnswer && (
          <div className="mt-6 whitespace-pre-wrap rounded-xl bg-black p-5 text-sm leading-7 text-zinc-200">
            {chatAnswer}
          </div>
        )}
      </WorkspaceSection>

      <WorkspaceSection
        icon={<Brain className="h-5 w-5" />}
        title="AI Paper Profile"
        description="Problem, methodology, datasets, findings, limitations, and future work."
      >
        <div className="whitespace-pre-wrap rounded-xl bg-black p-5 text-sm leading-7 text-zinc-200">
          {profile || "No profile yet. Click Generate Profile above."}
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        icon={<Sparkles className="h-5 w-5" />}
        title="Next Step"
        description="Use this paper with other papers in Research Studio."
      >
        <Link
          href="/dashboard/research"
          className="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          Go to Research Studio
        </Link>
      </WorkspaceSection>
    </div>
  );
}

function WorkspaceSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-lg bg-black p-2 text-zinc-300">{icon}</div>

        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}