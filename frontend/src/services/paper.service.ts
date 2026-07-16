import { apiFetch } from "@/lib/api";

export class PaperService {
  static async getPapers() {
    return apiFetch("/papers");
  }

  static async getPaper(paperId: string) {
    return apiFetch(`/papers/${paperId}`);
  }

  static async summarizePaper(paperId: string) {
    return apiFetch(`/papers/${paperId}/summarize`, {
      method: "POST",
    });
  }

  static async generateProfile(paperId: string) {
    return apiFetch(`/papers/${paperId}/profile`, {
      method: "POST",
    });
  }

  static async askQuestion(question: string) {
    return apiFetch("/chat/query", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  }

  static async comparePapers(paperIds: string[]) {
    return apiFetch("/research/compare", {
      method: "POST",
      body: JSON.stringify({
        paper_ids: paperIds,
      }),
    });
  }

  static async uploadPaper(file: File) {
    const token = localStorage.getItem("researchos_token");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/papers/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  }
}