import { getAnthropicClient } from "../lib/anthropic";
import type { IntakeInput, IntakeAnalysisResult } from "../types";

const SYSTEM_PROMPT = `You are a career analyst specializing in helping professionals document their work achievements.

Your job is to analyze a work log entry and extract structured information that can be used for resumes and portfolios.

Always respond in valid JSON format with the following structure:
{
  "summary": "Brief 1-2 sentence summary of what was done",
  "appeal_points": ["Point 1", "Point 2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "metrics": {
    "before": "situation before (optional)",
    "after": "result achieved (optional)",
    "unit": "metric unit e.g. %, hours, users (optional)",
    "description": "plain text description of the measurable outcome"
  },
  "tags": ["tag1", "tag2", ...]
}

Guidelines:
- appeal_points: 2-5 bullet points highlighting what's impressive or noteworthy about this work
- keywords: technical skills, tools, methodologies, domain keywords (5-10 items)
- metrics: extract any numbers, percentages, time savings, or measurable outcomes if present
- tags: broad categories like "frontend", "backend", "leadership", "analysis", "communication"
- If the input is in Korean, analyze in Korean context but use English for keywords and tags`;

// 업무 기록 원문을 분석해 구조화된 결과를 반환하는 Intake Agent
export async function runIntakeAgent(
  input: IntakeInput
): Promise<IntakeAnalysisResult> {
  const client = getAnthropicClient();

  const userMessage = `Please analyze the following work log entry:

Source: ${input.source}
Date: ${input.logged_at ?? "Not specified"}

Work Log:
${input.raw_content}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("Intake Agent: 응답에서 텍스트를 찾을 수 없습니다.");
  }

  try {
    // ```json ... ``` 블록 우선 추출, 없으면 { } 범위 추출
    const fencedMatch = textContent.text.match(/```json\s*([\s\S]*?)\s*```/);
    const braceMatch = textContent.text.match(/\{[\s\S]*\}/);
    const jsonString = fencedMatch?.[1] ?? braceMatch?.[0] ?? textContent.text;
    return JSON.parse(jsonString) as IntakeAnalysisResult;
  } catch {
    throw new Error(
      `Intake Agent: JSON 파싱 실패 — ${textContent.text.slice(0, 200)}`
    );
  }
}
