"use client";

import { useEffect, useState } from "react";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";

export default function ComparePage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState("");
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");

  async function loadPapers() {
    try {
      setLoading(true);
      const data = await PaperService.getPapers();
      setPapers(data.filter((paper: Paper) => paper.status === "ready"));
    } catch {
      setError("Failed to load papers");
    } finally {
      setLoading(false);
    }
  }

  function togglePaper(paperId: string) {
    setSelectedPaperIds((current) => {
      if (current.includes(paperId)) {
        return current.filter((id) => id !== paperId);
      }

      if (current.length >= 2) {
        return [current[1], paperId];
      }

      return [...current, paperId];
    });
  }

  async function comparePapers() {
    if (selectedPaperIds.length < 2) {
      alert("Select 2 papers to compare");
      return;
    }

    try {
      setComparing(true);
      setComparison("");

      const data = await PaperService.comparePapers(selectedPaperIds);
      setComparison(data.comparison);
    } catch {
      alert("Comparison failed. Make sure both papers have AI profiles.");
    } finally {
      setComparing(false);
    }
  }

  useEffect(() => {
    loadPapers();
  }, []);

  return (
    <div>
      <div>
        <p className="text-sm text-zinc-400">Research Tools</p>
        <h1 className="text-3xl font-bold">Compare Papers</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Select two ready papers and generate an AI comparison.
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">Select Papers</h2>

        {loading && <p className="mt-4 text-zinc-400">Loading papers...</p>}
        {error && <p className="mt-4 text-red-400">{error}</p>}

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

        <button
          onClick={comparePapers}
          disabled={comparing || selectedPaperIds.length < 2}
          className="mt-6 rounded-lg bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {comparing ? "Comparing..." : "Compare Selected Papers"}
        </button>
      </section>

      {comparison && (
        <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">AI Comparison</h2>

          <div className="mt-6 whitespace-pre-wrap rounded-lg bg-black p-5 text-sm leading-7 text-zinc-200">
            {comparison}
          </div>
        </section>
      )}
    </div>
  );
}