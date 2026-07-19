"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PaperService } from "@/services/paper.service";

const MAX_FILE_SIZE_MB = 25;

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  function validateFile(file: File) {
    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setError("Only PDF files are supported.");
      return false;
    }

    const fileSizeMb = file.size / 1024 / 1024;

    if (fileSizeMb > MAX_FILE_SIZE_MB) {
      setSelectedFile(null);
      setError(`PDF files must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
      return false;
    }

    setError("");
    setSelectedFile(file);
    return true;
  }

  function handleFileSelection(file?: File) {
    if (!file) {
      return;
    }

    validateFile(file);
  }

  async function handleUpload() {
    if (!selectedFile || uploading) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      await PaperService.uploadPaper(selectedFile);

      router.push("/dashboard/papers");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload paper"
      );
    } finally {
      setUploading(false);
    }
  }

  function clearSelection() {
    setSelectedFile(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="w-full space-y-7 pb-12">
      <div>
        <Link href="/dashboard/papers">
          <Button
            variant="secondary"
            className="rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 px-7 py-9 shadow-2xl shadow-black/20 md:px-10 md:py-11">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-blue-500/10 blur-[90px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-200">
            <Upload className="h-3.5 w-3.5" />
            Add to ResearchOS
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
            Upload a paper and start exploring.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            ResearchOS will extract the paper, create searchable chunks,
            generate embeddings, and prepare it for summaries, chat, and
            multi-paper analysis.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/10">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Upload document
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Select a PDF
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Drag and drop a file below, or browse from your computer.
            </p>
          </div>

          <div className="p-5 md:p-6">
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(event) =>
                handleFileSelection(event.target.files?.[0])
              }
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();

                if (event.currentTarget === event.target) {
                  setDragActive(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                handleFileSelection(event.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-[390px] w-full flex-col items-center justify-center rounded-[22px] border-2 border-dashed px-6 text-center transition duration-200 ${
                dragActive
                  ? "border-violet-400/60 bg-violet-400/[0.09]"
                  : "border-white/10 bg-white/[0.02] hover:border-violet-400/30 hover:bg-violet-400/[0.04]"
              }`}
            >
              <div
                className={`relative flex h-20 w-20 items-center justify-center rounded-2xl border transition ${
                  dragActive
                    ? "border-violet-400/30 bg-violet-400/15 text-violet-200"
                    : "border-white/10 bg-white/5 text-zinc-400"
                }`}
              >
                {dragActive ? (
                  <Upload className="h-8 w-8" />
                ) : (
                  <FileText className="h-8 w-8" />
                )}

                <div className="absolute -inset-5 -z-10 rounded-full bg-violet-500/10 blur-2xl" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-white">
                {dragActive ? "Drop the PDF here" : "Drag and drop your PDF"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Choose a research paper from your computer. Only PDF files are
                supported.
              </p>

              <div className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black">
                Browse Files
              </div>

              <p className="mt-4 text-xs text-zinc-600">
                Maximum file size: {MAX_FILE_SIZE_MB} MB
              </p>
            </button>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-300">
                {error}
              </div>
            )}

            {selectedFile && (
              <div className="mt-5 rounded-[20px] border border-violet-400/20 bg-violet-400/[0.06] p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-100">
                          {selectedFile.name}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={clearSelection}
                        disabled={uploading}
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Remove selected file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      PDF validated and ready to upload
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link href="/dashboard/papers">
                <Button
                  variant="secondary"
                  disabled={uploading}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 sm:w-auto"
                >
                  Cancel
                </Button>
              </Link>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="h-11 w-full rounded-xl bg-white px-5 text-black hover:bg-zinc-200 sm:w-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Paper
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[24px] border border-white/10 bg-zinc-950/80 p-6 shadow-xl shadow-black/10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              What happens next
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Automatic AI processing
            </h2>

            <div className="mt-6 space-y-5">
              <ProcessingStep
                number="01"
                title="Text extraction"
                description="ResearchOS extracts and cleans the paper’s text."
              />

              <ProcessingStep
                number="02"
                title="Chunking and indexing"
                description="The paper is divided into searchable semantic chunks."
              />

              <ProcessingStep
                number="03"
                title="Vector embeddings"
                description="Embeddings are generated and stored in Qdrant."
              />

              <ProcessingStep
                number="04"
                title="Workspace ready"
                description="You can summarize, chat, profile, and compare the paper."
              />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[24px] border border-violet-400/20 bg-violet-400/[0.06] p-6">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                Built for research workflows
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Uploaded papers remain connected to your private account and
                are prepared for AI analysis inside your ResearchOS library.
              </p>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-zinc-950/80 p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
              <Sparkles className="h-4 w-4" />
              Best results
            </div>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Use text-based academic PDFs rather than scanned image-only files
              for the highest quality extraction, summaries, and answers.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

function ProcessingStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-xs font-semibold text-violet-300">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-200">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-zinc-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  const megabytes = bytes / 1024 / 1024;

  if (megabytes >= 1) {
    return `${megabytes.toFixed(2)} MB`;
  }

  return `${(bytes / 1024).toFixed(0)} KB`;
}