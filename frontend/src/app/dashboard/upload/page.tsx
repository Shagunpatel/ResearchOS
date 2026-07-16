"use client";

import { useRef, useState } from "react";
import { PaperService } from "@/services/paper.service";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleUpload() {
    if (!selectedFile) return;

    try {
      setUploading(true);

      await PaperService.uploadPaper(selectedFile);

      router.push("/dashboard/papers");
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div>
        <p className="text-sm text-zinc-400">Research Library</p>
        <h1 className="text-3xl font-bold">Upload Paper</h1>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">

        <p className="text-5xl">📄</p>

        <h2 className="mt-4 text-xl font-semibold">
          Drag & Drop your PDF
        </h2>

        <p className="mt-2 text-zinc-400">
          or click below to browse
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          hidden
          onChange={(e) => {
            if (e.target.files?.length) {
              setSelectedFile(e.target.files[0]);
            }
          }}
        />

        <button
          onClick={() => inputRef.current?.click()}
          className="mt-6 rounded-lg border border-zinc-700 px-4 py-2"
        >
          Choose PDF
        </button>

        {selectedFile && (
            <>
                <div className="mt-6 rounded-lg bg-zinc-800 p-4">
                <p className="font-medium">{selectedFile.name}</p>

                <p className="text-sm text-zinc-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                </div>

                <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-6 rounded-lg bg-white px-5 py-2 font-medium text-black disabled:opacity-50"
                >
                {uploading ? "Uploading..." : "Upload Paper"}
                </button>
            </>
        )}
      </div>
    </div>
  );
}