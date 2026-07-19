import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 py-6 lg:px-8 xl:px-10">{children}</main>
    </div>
  );
}