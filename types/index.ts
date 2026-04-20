// DB 테이블에 대응하는 TypeScript 타입 정의

export type WorkLogSource =
  | "manual"
  | "chat_paste"
  | "file_upload"
  | "notion"
  | "slack";

export type AgentType = "intake" | "hr_expert" | "resume" | "portfolio";

export type ResumItemCategory =
  | "experience"
  | "achievement"
  | "skill"
  | "project";

// profiles 테이블
export interface Profile {
  id: string;
  display_name: string | null;
  job_role: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
}

// work_logs 테이블
export interface WorkLog {
  id: string;
  user_id: string;
  logged_at: string; // DATE (ISO string)
  raw_content: string;
  source: WorkLogSource;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ai_analyses 테이블
export interface AiAnalysis {
  id: string;
  work_log_id: string;
  agent_type: AgentType;
  summary: string | null;
  appeal_points: string[];
  keywords: string[];
  metrics: Record<string, unknown>;
  raw_output: Record<string, unknown>;
  created_at: string;
}

// resume_items 테이블
export interface ResumeItem {
  id: string;
  user_id: string;
  work_log_id: string | null;
  category: ResumItemCategory;
  content: string;
  jd_keywords: string[];
  is_starred: boolean;
  created_at: string;
  updated_at: string;
}

// weekly_summaries 테이블
export interface WeeklySummary {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  summary_content: string | null;
  highlights: string[];
  created_at: string;
}

// Intake Agent 입력/출력 타입
export interface IntakeInput {
  raw_content: string;
  source: WorkLogSource;
  logged_at?: string;
}

export interface IntakeAnalysisResult {
  summary: string;
  appeal_points: string[];
  keywords: string[];
  metrics: {
    before?: string;
    after?: string;
    unit?: string;
    description?: string;
  };
  tags: string[];
}
