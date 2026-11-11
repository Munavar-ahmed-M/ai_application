import { executeTool } from "./executor.js";
import { WEBSITE_AGENT_PROMPT } from "./prompt.js";

export async function runAgentLoop(
  state,
  { modelTurn, toolExecutor = executeTool } = {},
) {
  if (!modelTurn) {
    const geminiService = await import("#src/services/gemini.services.js");

    modelTurn = geminiService.generateModelTurn;
  }
  while (state.iteration < state.maxIterations) {
    state.iteration += 1;
    console.log(`\nIteration ${state.iteration}: Gemini request started`);

    const response = await modelTurn(state.history, WEBSITE_AGENT_PROMPT);

    console.log(`Iteration ${state.iteration}: Gemini response received`);
    const modelContent = response.candidates?.[0]?.content;
    if (!modelContent?.parts?.length) {
      state.status = "failed";
      return {
        success: false,
        status: state.status,
        message: "Model returned no usable content",
        state,
      };
    }
    // Retain the model's *actual* content (including function-call IDs/signatures).
    state.history.push(modelContent);
    const calls = modelContent.parts
      .filter((part) => part.functionCall)
      .map((part) => part.functionCall);
    if (calls.length === 0) {
      console.log("Agent completed. No more tools requested.");
      state.status = "completed";
      const message = modelContent.parts
        .map((part) => part.text || "")
        .join("\n")
        .trim();
      return {
        success: true,
        status: state.status,
        message: message || "Agent stopped without a message",
        state,
      };
    }

    const results = [];
    for (const call of calls) {
      const result = await toolExecutor(call, state.projectId);
      state.observations.push({
        iteration: state.iteration,
        tool: call.name,
        result,
      });
      results.push({
        functionResponse: {
          name: call.name,
          response: result,
          ...(call.id ? { id: call.id } : {}),
        },
      });
    }
    // Gemini function responses belong to a 'user' turn.
    state.history.push({ role: "user", parts: results });
  }
  state.status = "max_iterations";
  return {
    success: false,
    status: state.status,
    message: `Agent stopped after ${state.maxIterations} iterations`,
    state,
  };
}
