import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { NavWrapper } from "@/components/navigation/nav-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-bg-primary">
      <NavWrapper />
      <main className="mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
