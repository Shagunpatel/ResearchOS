"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPapers() {
    try {
      setLoading(true);
      const data = await PaperService.getPapers();
      setPapers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load papers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPapers();
  }, []);

  const readyCount = papers.filter((paper) => paper.status === "ready").length;
  const processingCount = papers.filter(
    (paper) => paper.status === "queued" || paper.status === "processing"
  ).length;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Research Library</p>
          <h2 className="text-3xl font-bold">My Papers</h2>
        </div>

        <Link href="/dashboard/upload">
            <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Paper
            </Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Total Papers" value={papers.length} />
        <StatCard label="Ready" value={readyCount} />
        <StatCard label="Processing" value={processingCount} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Papers</CardTitle>
          <p className="text-sm text-muted-foreground">
            View uploaded papers and processing status.
          </p>
        </CardHeader>

        <CardContent>
          {loading && <p className="text-muted-foreground">Loading papers...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && papers.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No papers yet.</p>

              <Button className="mt-4">
                    <Link href="/dashboard/upload">Upload your first PDF</Link>
              </Button>
            </div>
          )}

          {!loading && !error && papers.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {papers.map((paper) => (
                <Card key={paper.id} className="bg-zinc-950">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
                        <FileText className="h-5 w-5 text-zinc-300" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="line-clamp-1 font-semibold">
                              {paper.title || paper.filename}
                            </h3>

                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                              {paper.filename}
                            </p>
                          </div>

                          <StatusBadge status={paper.status} />
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                          Uploaded{" "}
                          {new Date(paper.uploaded_at).toLocaleString()}
                        </p>

                        <div className="mt-4">
                          <Link href={`/dashboard/papers/${paper.id}`}>
                                <Button size="sm" variant="secondary">Open</Button>
                            </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <h3 className="mt-2 text-3xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Paper["status"] }) {
  const variant =
    status === "ready"
      ? "default"
      : status === "failed"
        ? "destructive"
        : "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}