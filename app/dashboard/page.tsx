import { createClient } from "../../lib/supabase/server";
import LogForm from "./components/LogForm";
import type { WorkLog, AiAnalysis } from "../../types";

type WorkLogWithAnalysis = WorkLog & {
  ai_analyses: AiAnalysis[];
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: logs } = (await supabase
    .from("work_logs")
    .select("*, ai_analyses(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20)) as { data: WorkLogWithAnalysis[] | null };

  return (
    <div className="flex flex-col gap-8">
      <LogForm />

      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
          최근 기록
        </h2>

        {!logs || logs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200 border-dashed">
            <p className="text-sm text-zinc-400">
              아직 기록이 없습니다.
              <br />
              위 폼에서 첫 번째 업무 기록을 남겨보세요.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log) => {
              const analysis = log.ai_analyses?.[0];
              return (
                <article
                  key={log.id}
                  className="bg-white rounded-xl border border-zinc-200 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-zinc-400">{log.logged_at}</span>
                    {log.tags?.length > 0 && (
                      <div className="flex gap-1.5">
                        {log.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-zinc-800 leading-relaxed mb-3">
                    {analysis?.summary ?? log.raw_content}
                  </p>

                  {analysis?.keywords && analysis.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
