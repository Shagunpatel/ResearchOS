"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PaperService } from "@/services/paper.service";
import type { Paper } from "@/types/paper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const [papers, setPapers] = useState<Paper[]>([]);

  useEffect(() => {
    async function loadPapers() {
      const data = await PaperService.getPapers();
      setPapers(data);
    }

    loadPapers();
  }, []);

  const readyCount = papers.filter((p) => p.status === "ready").length;
  const processingCount = papers.filter(
    (p) => p.status === "queued" || p.status === "processing"
  ).length;

  return (
    <div>
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h2 className="text-3xl font-bold">Research Dashboard</h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Total Papers" value={papers.length} />
        <StatCard label="Ready" value={readyCount} />
        <StatCard label="Processing" value={processingCount} />
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold">Quick Actions</h3>

          <div className="mt-4 flex gap-3">
            <Link href="/dashboard/upload">
                <Button>Upload Paper</Button>
            </Link>

            <Link href="/dashboard/chat">
                <Button variant="secondary">Ask ResearchOS</Button>
            </Link>
          </div>
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