export function createAgentState({ projectId, userMessage, maxIterations = 20 }) {
  return {
    projectId,
    iteration: 0,
    maxIterations,
    status: "running",
    history: [{ role: "user", parts: [{ text: userMessage }] }],
    observations: [],
  };
}
