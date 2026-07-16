"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";

type Tab = "summary" | "chat" | "profile" | "compare";

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
  const [activeTab, setActiveTab] = useState<Tab>("summary");

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

  if (loading) return <div className="text-zinc-400">Loading paper...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!paper) return <div className="text-zinc-400">Paper not found.</div>;

  return (
    <div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm text-zinc-400">Paper Workspace</p>
        <h1 className="mt-2 text-3xl font-bold">
          {paper.title || paper.filename}
        </h1>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-400">
          <span>Filename: {paper.filename}</span>
          <span>Status: {paper.status}</span>
          <span>Uploaded: {new Date(paper.uploaded_at).toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-3 border-b border-zinc-800">
        {(["summary", "chat", "profile", "compare"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm capitalize ${
              activeTab === tab
                ? "border-b-2 border-white font-semibold text-white"
                : "text-zinc-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "summary" && (
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">AI Summary</h2>
              <p className="text-sm text-zinc-400">
                Generate a structured summary of this paper.
              </p>
            </div>

            <button
              onClick={generateSummary}
              disabled={summaryLoading || paper.status !== "ready"}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {summaryLoading ? "Generating..." : "Generate Summary"}
            </button>
          </div>

          <div className="mt-6 whitespace-pre-wrap rounded-lg bg-black p-5 text-sm leading-7 text-zinc-200">
            {summary || "No summary yet. Click Generate Summary."}
          </div>
        </section>
      )}

      {activeTab === "chat" && (
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Ask ResearchOS</h2>
          <p className="text-sm text-zinc-400">
            Ask a citation-grounded question across your uploaded papers.
          </p>

          <textarea
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            placeholder="Example: What dataset is used in this paper?"
            className="mt-6 min-h-28 w-full rounded-lg border border-zinc-700 bg-black p-4 text-sm text-white outline-none"
          />

          <button
            onClick={askQuestion}
            disabled={chatLoading}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {chatLoading ? "Thinking..." : "Ask"}
          </button>

          {chatAnswer && (
            <div className="mt-6 whitespace-pre-wrap rounded-lg bg-black p-5 text-sm leading-7 text-zinc-200">
              {chatAnswer}
            </div>
          )}
        </section>
      )}

      {activeTab === "profile" && (
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">AI Paper Profile</h2>
              <p className="text-sm text-zinc-400">
                Extract problem, methods, datasets, results, and limitations.
              </p>
            </div>

            <button
              onClick={generateProfile}
              disabled={profileLoading || paper.status !== "ready"}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {profileLoading ? "Generating..." : "Generate Profile"}
            </button>
          </div>

          <div className="mt-6 whitespace-pre-wrap rounded-lg bg-black p-5 text-sm leading-7 text-zinc-200">
            {profile || "No profile yet. Click Generate Profile."}
          </div>
        </section>
      )}

      {activeTab === "compare" && (
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          Compare coming next.
        </section>
      )}
    </div>
  );
}