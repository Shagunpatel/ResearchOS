export type PaperStatus = "queued" | "processing" | "ready" | "failed";

export type Paper = {
  id: string;
  title: string | null;
  authors: string | null;
  year: number | null;
  abstract: string | null;
  summary: string | null;
  profile: Record<string, unknown> | null;
  filename: string;
  status: PaperStatus;
  error_message: string | null;
  uploaded_at: string;
};