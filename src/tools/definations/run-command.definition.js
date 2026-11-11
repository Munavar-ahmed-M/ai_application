// Keep this for a later isolated runner. Do NOT expose it in toolDefinitions yet.
export const runCommandDefinition = {
  name: "run_command",
  description: "Run an approved operation in an isolated project runtime (unavailable in MVP)",
  parameters: {
    type: "object",
    properties: { operation: { type: "string", enum: ["build", "test"] } },
    required: ["operation"]
  }
};
