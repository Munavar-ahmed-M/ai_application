import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { runAgentLoop } from "#src/agent/loop.js";
import { createAgentState } from "#src/agent/state.js";
import {
  ensureSandbox,
  newProjectId,
  getSandboxPath,
} from "#src/sandbox/sandbox.manager.js";

const projectId = newProjectId();
await ensureSandbox(projectId);
const state = createAgentState({ projectId, userMessage: "Create a page" });
let calls = 0;
const fakeModel = async (history) => {
  calls++;
  if (calls === 1)
    return {
      candidates: [
        {
          content: {
            role: "model",
            parts: [
              {
                functionCall: {
                  name: "create_file",
                  args: { path: "index.html", content: "<h1>Hello</h1>" },
                },
              },
            ],
          },
        },
      ],
    };
  assert.equal(history.at(-1).parts[0].functionResponse.response.success, true);
  return {
    candidates: [
      { content: { role: "model", parts: [{ text: "Created index.html" }] } },
    ],
  };
};
try {
  const result = await runAgentLoop(state, { modelTurn: fakeModel });
  assert.equal(result.success, true);
  assert.equal(calls, 2);
  assert.equal(
    await fs.readFile(getSandboxPath(projectId) + "/index.html", "utf8"),
    "<h1>Hello</h1>",
  );
  console.log(
    "PASS: Agent observed tool execution and continued to a second model turn.",
  );
} finally {
  await fs.rm(getSandboxPath(projectId), { recursive: true, force: true });
}
