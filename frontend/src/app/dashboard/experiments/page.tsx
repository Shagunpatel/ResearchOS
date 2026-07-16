"use client";

import { useEffect, useState } from "react";
import {
  Experiment,
  ExperimentService,
} from "@/services/experiment.service";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [modelName, setModelName] = useState("");
  const [dataset, setDataset] = useState("");
  const [metrics, setMetrics] = useState("");
  const [notes, setNotes] = useState("");

  async function loadExperiments() {
    try {
      setLoading(true);
      const data = await ExperimentService.getExperiments();
      setExperiments(data);
    } finally {
      setLoading(false);
    }
  }

  async function createExperiment(e: React.FormEvent) {
    e.preventDefault();

    await ExperimentService.createExperiment({
      name,
      model_name: modelName || undefined,
      dataset: dataset || undefined,
      metrics: metrics ? { raw: metrics } : undefined,
      notes: notes || undefined,
    });

    setName("");
    setModelName("");
    setDataset("");
    setMetrics("");
    setNotes("");

    await loadExperiments();
  }

  useEffect(() => {
    loadExperiments();
  }, []);

  return (
    <div>
      <div>
        <p className="text-sm text-zinc-400">ML Research</p>
        <h1 className="text-3xl font-bold">Experiment Tracker</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Track models, datasets, metrics, and notes.
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">New Experiment</h2>

        <form onSubmit={createExperiment} className="mt-6 grid gap-4">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Experiment name"
            className="rounded-lg border border-zinc-700 bg-black p-3 text-sm"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Model name"
              className="rounded-lg border border-zinc-700 bg-black p-3 text-sm"
            />

            <input
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              placeholder="Dataset"
              className="rounded-lg border border-zinc-700 bg-black p-3 text-sm"
            />
          </div>

          <input
            value={metrics}
            onChange={(e) => setMetrics(e.target.value)}
            placeholder="Metrics, e.g. accuracy=0.94, loss=0.21"
            className="rounded-lg border border-zinc-700 bg-black p-3 text-sm"
          />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Experiment notes"
            className="min-h-28 rounded-lg border border-zinc-700 bg-black p-3 text-sm"
          />

          <button className="w-fit rounded-lg bg-white px-5 py-2 text-sm font-medium text-black">
            Save Experiment
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">Saved Experiments</h2>

        {loading && <p className="mt-4 text-zinc-400">Loading...</p>}

        {!loading && experiments.length === 0 && (
          <p className="mt-4 text-zinc-400">No experiments yet.</p>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {experiments.map((experiment) => (
            <div
              key={experiment.id}
              className="rounded-xl border border-zinc-800 bg-black p-5"
            >
              <h3 className="font-semibold">{experiment.name}</h3>

              <p className="mt-2 text-sm text-zinc-400">
                Model: {experiment.model_name || "Not provided"}
              </p>

              <p className="text-sm text-zinc-400">
                Dataset: {experiment.dataset || "Not provided"}
              </p>

              {experiment.metrics && (
                <p className="mt-3 text-sm text-zinc-300">
                  Metrics: {JSON.stringify(experiment.metrics)}
                </p>
              )}

              {experiment.notes && (
                <p className="mt-3 text-sm text-zinc-400">
                  {experiment.notes}
                </p>
              )}

              <p className="mt-4 text-xs text-zinc-500">
                Created {new Date(experiment.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}