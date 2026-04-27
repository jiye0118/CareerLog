import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runIntakeAgent } from "../../../agents/intakeAgent";
import { createClient } from "../../../lib/supabase/server";

const IntakeRequestSchema = z.object({
  raw_content: z.string().min(10, "내용을 10자 이상 입력해주세요."),
  source: z
    .enum(["manual", "chat_paste", "file_upload", "notion", "slack"])
    .default("manual"),
  logged_at: z.string().optional(), // ISO date string (YYYY-MM-DD)
});

// POST /api/intake
// 업무 기록을 받아 AI 분석 후 DB에 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = IntakeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { raw_content, source, logged_at } = parsed.data;

    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 1) 업무 기록 저장
    const { data: workLog, error: workLogError } = await supabase
      .from("work_logs")
      .insert({
        user_id: user.id,
        raw_content,
        source,
        logged_at: logged_at ?? new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (workLogError || !workLog) {
      console.error("work_logs 저장 실패:", workLogError);
      return NextResponse.json(
        { error: "업무 기록 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    // 2) Intake Agent 실행
    const analysisResult = await runIntakeAgent({ raw_content, source, logged_at });

    // 3) AI 분석 결과 저장
    const { data: analysis, error: analysisError } = await supabase
      .from("ai_analyses")
      .insert({
        work_log_id: workLog.id,
        agent_type: "intake",
        summary: analysisResult.summary,
        appeal_points: analysisResult.appeal_points,
        keywords: analysisResult.keywords,
        metrics: analysisResult.metrics,
        raw_output: analysisResult,
      })
      .select()
      .single();

    if (analysisError) {
      console.error("ai_analyses 저장 실패:", analysisError);
      return NextResponse.json(
        { error: "AI 분석 결과 저장에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    // 4) work_logs에 태그 업데이트
    await supabase
      .from("work_logs")
      .update({ tags: analysisResult.tags })
      .eq("id", workLog.id);

    return NextResponse.json({
      work_log: workLog,
      analysis,
      result: analysisResult,
    });
  } catch (error) {
    console.error("Intake API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
