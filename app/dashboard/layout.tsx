import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { signOut } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-zinc-900 tracking-tight">
            CareerLog
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
