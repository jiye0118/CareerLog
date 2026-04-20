-- CareerLog DB 스키마
-- Supabase SQL Editor에서 실행하세요.
-- MVP + v2 확장성을 고려한 설계

-- ============================================================
-- 유저 프로필 (Supabase Auth 연동)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  job_role TEXT,                -- 현재 직무 (예: "백엔드 엔지니어")
  industry TEXT,                -- 업종 (예: "핀테크", "헬스케어")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 업무 기록 (핵심 테이블)
-- ============================================================
CREATE TABLE work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  raw_content TEXT NOT NULL,    -- 사용자가 입력한 원문
  source TEXT NOT NULL DEFAULT 'manual',
  -- 'manual' | 'chat_paste' | 'file_upload' | 'notion' | 'slack'
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI 분석 결과
-- ============================================================
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_log_id UUID NOT NULL REFERENCES work_logs(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  -- 'intake' | 'hr_expert' | 'resume' | 'portfolio' | 'ux'
  summary TEXT,                 -- 요약문
  appeal_points TEXT[],         -- 어필 포인트 목록
  keywords TEXT[],              -- 추출된 키워드 (기술 스택, 도메인 등)
  metrics JSONB DEFAULT '{}',
  -- { "before": "...", "after": "...", "unit": "...", "description": "..." }
  raw_output JSONB DEFAULT '{}',-- 에이전트 전체 응답 (디버깅 및 재분석용)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 이력서 항목
-- ============================================================
CREATE TABLE resume_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  work_log_id UUID REFERENCES work_logs(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  -- 'experience' | 'achievement' | 'skill' | 'project'
  content TEXT NOT NULL,        -- 이력서에 들어갈 최종 문장
  jd_keywords TEXT[],           -- 매핑된 JD 키워드 (v1.5+)
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 주간 요약 (Stage 04)
-- ============================================================
CREATE TABLE weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary_content TEXT,
  highlights TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ============================================================
-- Row Level Security (RLS) 활성화
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS 정책 — 본인 데이터만 접근 가능
-- ============================================================
CREATE POLICY "users can manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "users can manage own work logs"
  ON work_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "users can view own analyses"
  ON ai_analyses FOR ALL
  USING (
    work_log_id IN (
      SELECT id FROM work_logs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users can manage own resume items"
  ON resume_items FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "users can manage own summaries"
  ON weekly_summaries FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- 신규 유저 가입 시 profiles 자동 생성 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
