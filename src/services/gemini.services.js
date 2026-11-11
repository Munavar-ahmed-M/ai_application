import ai from "#src/config/gemini.js";
import { toolDefinitions } from "#src/tools/index.js";

const MODEL = "gemini-3.5-flash-lite";

// One LLM turn only. The agent owns the loop and history.
export async function generateModelTurn(history, systemPrompt) {
  return ai.models.generateContent({
    model: MODEL,
    contents: history,
    config: { systemInstruction: systemPrompt, tools: toolDefinitions },
  });
}

// Keeps your old controller interface if it used generateAIResponse(message).
export async function generateAIResponse(message) {
  const { runAgent } = await import("#src/agent/agent.js");
  const result = await runAgent({ userMessage: message });
  return result.message;
}
