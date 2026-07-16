import { apiFetch } from "@/lib/api";

export type Experiment = {
  id: string;
  name: string;
  model_name: string | null;
  dataset: string | null;
  hyperparameters: Record<string, unknown> | null;
  metrics: Record<string, unknown> | null;
  result_summary: string | null;
  notes: string | null;
  created_at: string;
};

export type ExperimentPayload = {
  name: string;
  model_name?: string;
  dataset?: string;
  hyperparameters?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  result_summary?: string;
  notes?: string;
};

export class ExperimentService {
  static async getExperiments() {
    return apiFetch("/experiments");
  }

  static async createExperiment(payload: ExperimentPayload) {
    return apiFetch("/experiments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  static async getExperiment(experimentId: string) {
    return apiFetch(`/experiments/${experimentId}`);
  }

  static async updateExperiment(
    experimentId: string,
    payload: ExperimentPayload
  ) {
    return apiFetch(`/experiments/${experimentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  static async deleteExperiment(experimentId: string) {
    return apiFetch(`/experiments/${experimentId}`, {
      method: "DELETE",
    });
  }
}