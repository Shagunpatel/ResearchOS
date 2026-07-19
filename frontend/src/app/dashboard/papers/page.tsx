"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Brain, FileText, RefreshCw, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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
    loadPapers(true);
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
      loadPapers(false);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [papers, loadPapers]);

  const readyCount = papers.filter(
    (paper) => paper.status === "ready"
  ).length;

  const processingCount = papers.filter(
    (paper) =>
      paper.status === "queued" || paper.status === "processing"
  ).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Research Library
          </p>
          <h1 className="text-3xl font-bold">My Papers</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload, process, and open papers in your AI workspace.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => loadPapers(false)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>

          <Link href="/dashboard/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Paper
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Total Papers" value={papers.length} />
        <StatCard label="Ready" value={readyCount} />
        <StatCard label="Processing" value={processingCount} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Research Library</CardTitle>
          <p className="text-sm text-muted-foreground">
            Processing papers refresh automatically every three seconds.
          </p>
        </CardHeader>

        <CardContent>
          {loading && (
            <p className="text-muted-foreground">
              Loading papers...
            </p>
          )}

          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && papers.length === 0 && (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />

              <h2 className="mt-4 text-lg font-semibold">
                Your library is empty
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Upload a PDF to start building your research library.
              </p>

              <Link
                href="/dashboard/upload"
                className="mt-5 inline-block"
              >
                <Button>Upload your first paper</Button>
              </Link>
            </div>
          )}

          {!loading && !error && papers.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaperCard({ paper }: { paper: Paper }) {
  const isReady = paper.status === "ready";
  const hasSummary = Boolean(paper.summary);
  const hasProfile = Boolean(paper.profile);

  return (
    <Card className="bg-zinc-950">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
            <FileText className="h-5 w-5 text-zinc-300" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-semibold">
                  {paper.title || paper.filename}
                </h2>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {paper.filename}
                </p>
              </div>

              <StatusBadge status={paper.status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">
                Summary {hasSummary ? "ready" : "not generated"}
              </Badge>

              <Badge variant="secondary">
                Profile {hasProfile ? "ready" : "not generated"}
              </Badge>
            </div>

            {paper.error_message && (
              <p className="mt-3 text-sm text-red-400">
                {paper.error_message}
              </p>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              Uploaded{" "}
              {new Date(paper.uploaded_at).toLocaleString()}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/dashboard/papers/${paper.id}`}>
                <Button size="sm" disabled={!isReady}>
                  Open Workspace
                </Button>
              </Link>

              {isReady && (
                <Link href="/dashboard/research">
                  <Button size="sm" variant="secondary">
                    <Brain className="mr-2 h-4 w-4" />
                    Research Studio
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({
  status,
}: {
  status: Paper["status"];
}) {
  if (status === "ready") {
    return <Badge>Ready</Badge>;
  }

  if (status === "failed") {
    return <Badge variant="destructive">Failed</Badge>;
  }

  return (
    <Badge variant="secondary">
      {status === "queued" ? "Queued" : "Processing"}
    </Badge>
  );
}