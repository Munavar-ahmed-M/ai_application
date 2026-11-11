import { newProjectId, ensureSandbox } from "#src/sandbox/sandbox.manager.js";
import { createAgentState } from "./state.js";
import { runAgentLoop } from "./loop.js";

export async function runAgent({ userMessage, projectId = newProjectId(), maxIterations = 20 }) {
  if (typeof userMessage !== "string" || !userMessage.trim()) throw new Error("Message required");
  await ensureSandbox(projectId);
  const state = createAgentState({ projectId, userMessage, maxIterations });
  const result = await runAgentLoop(state);
  return { success: result.success, status: result.status, projectId, message: result.message, observations: state.observations };
}
