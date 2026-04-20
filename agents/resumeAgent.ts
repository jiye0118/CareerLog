// Resume Agent — Stage 01 stub
// 이력서 항목 문장 생성 · JD 매핑을 담당 (MVP Stage 03에서 구현 예정)

export interface ResumeAgentInput {
  summary: string;
  appeal_points: string[];
  keywords: string[];
  category: "experience" | "achievement" | "skill" | "project";
  jd_text?: string;
}

export interface ResumeAgentResult {
  resume_bullets: string[]; // 이력서에 바로 쓸 수 있는 문장 목록
  jd_matched_keywords: string[];
}

// TODO: Stage 03에서 Claude API 호출로 구현
export async function runResumeAgent(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _input: ResumeAgentInput
): Promise<ResumeAgentResult> {
  throw new Error("Resume Agent는 Stage 03에서 구현될 예정입니다.");
}
