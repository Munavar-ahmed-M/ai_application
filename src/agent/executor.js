import { toolFunctions } from "#src/tools/index.js";

export async function executeTool(functionCall, projectId) {
  const name = functionCall?.name;
  const fn = Object.hasOwn(toolFunctions, name) ? toolFunctions[name] : undefined;
  if (typeof fn !== "function") {
    return { success: false, error: { type: "UNKNOWN_TOOL", message: `Tool not allowed: ${name}` } };
  }
  try {
    const supplied = functionCall.args;
    if (!supplied || typeof supplied !== "object" || Array.isArray(supplied)) {
      throw new Error("Tool arguments must be an object");
    }
    // Security: projectId must always come from server state, not model arguments.
    return await fn({ ...supplied, projectId });
  } catch (error) {
    return { success: false, error: { type: "EXECUTION_ERROR", message: error.message } };
  }
}
