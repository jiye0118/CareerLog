import Anthropic from "@anthropic-ai/sdk";

// Anthropic 클라이언트 싱글턴 (서버 사이드 전용)
let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}
