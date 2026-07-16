import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold">ResearchOS</h1>
        <p className="mt-3 text-zinc-400">AI Research Copilot</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login" className="rounded-lg border px-4 py-2">
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-white px-4 py-2 text-black"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}