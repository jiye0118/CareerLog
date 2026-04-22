"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IntakeAnalysisResult } from "../../../types";

export default function LogForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [source, setSource] = useState("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<IntakeAnalysisResult | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_content: content, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }

      setLastResult(data.result as IntakeAnalysisResult);
      setContent("");
      router.refresh(); // 서버 컴포넌트(로그 목록) 재조회
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      <h2 className="text-sm font-semibold text-zinc-900 mb-4">
        오늘의 업무 기록
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-fit text-xs border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
        >
          <option value="manual">직접 입력</option>
          <option value="chat_paste">AI 대화 붙여넣기</option>
          <option value="notion">Notion</option>
          <option value="slack">Slack</option>
        </select>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`오늘 어떤 업무를 했나요? 자유롭게 기록해보세요.\n\n예) 결제 API 성능 개선 작업 완료. 응답 시간이 800ms → 200ms로 단축됨. Redis 캐싱 도입 및 불필요한 DB 쿼리 3개 제거.`}
          rows={6}
          required
          className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || content.trim().length < 10}
            className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "분석 중..." : "기록 저장"}
          </button>
        </div>
      </form>

      {lastResult && (
        <div className="mt-5 pt-5 border-t border-zinc-100">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
            AI 분석 완료
          </p>
          <p className="text-sm text-zinc-700 mb-3">{lastResult.summary}</p>
          {lastResult.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {lastResult.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded-full"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
