// HR Expert Agent — Stage 01 stub
// 직무 분석 · 어필 포인트 강화를 담당 (MVP Stage 03에서 구현 예정)

export interface HrExpertInput {
  summary: string;
  appeal_points: string[];
  keywords: string[];
  target_role?: string;
  jd_text?: string;
}

export interface HrExpertResult {
  enhanced_appeal_points: string[];
  role_fit_score: number; // 0-100
  missing_keywords: string[];
  suggestions: string[];
}

// TODO: Stage 03에서 Claude API 호출로 구현
export async function runHrExpertAgent(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _input: HrExpertInput
): Promise<HrExpertResult> {
  throw new Error("HR Expert Agent는 Stage 03에서 구현될 예정입니다.");
}
