"use client";

import { useEffect, useState } from "react";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";

type ActionType = "compare" | "related-work" | "gaps";

export default function ResearchStudioPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function loadPapers() {
    try {
      setLoading(true);
      const data = await PaperService.getPapers();
      setPapers(data.filter((paper: Paper) => paper.status === "ready"));
    } finally {
      setLoading(false);
    }
  }

  function togglePaper(paperId: string) {
    setSelectedPaperIds((current) => {
      if (current.includes(paperId)) {
        return current.filter((id) => id !== paperId);
      }

      return [...current, paperId];
    });
  }

  async function runAction(action: ActionType) {
    if (selectedPaperIds.length < 2) {
      alert("Select at least 2 ready papers.");
      return;
    }

    try {
      setGenerating(true);
      setActiveAction(action);
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
    } catch {
      alert("Action failed. Make sure selected papers have AI profiles.");
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    loadPapers();
  }, []);

  return (
    <div>
      <div>
        <p className="text-sm text-zinc-400">Multi-paper intelligence</p>
        <h1 className="text-3xl font-bold">Research Studio</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Compare papers, generate related work, and identify research gaps.
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">1. Select Papers</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Choose two or more ready papers.
        </p>

        {loading && <p className="mt-4 text-zinc-400">Loading papers...</p>}

        {!loading && papers.length === 0 && (
          <p className="mt-4 text-zinc-400">
            No ready papers found. Upload and process papers first.
          </p>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {papers.map((paper) => {
            const selected = selectedPaperIds.includes(paper.id);

            return (
              <button
                key={paper.id}
                onClick={() => togglePaper(paper.id)}
                className={`rounded-xl border p-5 text-left transition ${
                  selected
                    ? "border-white bg-zinc-800"
                    : "border-zinc-800 bg-black hover:bg-zinc-950"
                }`}
              >
                <p className="font-semibold">{paper.title || paper.filename}</p>
                <p className="mt-1 text-sm text-zinc-400">{paper.filename}</p>
                <p className="mt-3 text-xs text-zinc-500">
                  {selected ? "Selected" : "Click to select"}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">2. Research Task</h2>

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Optional topic, e.g. Autonomous Racing"
          className="mt-5 w-full rounded-lg border border-zinc-700 bg-black p-3 text-sm text-white outline-none"
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => runAction("compare")}
            disabled={generating}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            Compare Papers
          </button>

          <button
            onClick={() => runAction("related-work")}
            disabled={generating}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:opacity-50"
          >
            Generate Related Work
          </button>

          <button
            onClick={() => runAction("gaps")}
            disabled={generating}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:opacity-50"
          >
            Find Research Gaps
          </button>
        </div>

        {generating && (
          <p className="mt-4 text-sm text-zinc-400">
            ResearchOS is thinking...
          </p>
        )}
      </section>

      {output && (
        <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">
            {activeAction === "compare" && "Paper Comparison"}
            {activeAction === "related-work" && "Related Work"}
            {activeAction === "gaps" && "Research Gaps"}
          </h2>

          <div className="mt-6 whitespace-pre-wrap rounded-lg bg-black p-5 text-sm leading-7 text-zinc-200">
            {output}
          </div>
        </section>
      )}
    </div>
  );
}