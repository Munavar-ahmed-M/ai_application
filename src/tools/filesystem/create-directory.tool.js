import fs from "node:fs/promises";
import { checkedSandboxPath } from "../../sandbox/sandbox.manager.js";
export async function createDirectory({ projectId, path: directoryPath }) {
  try {
    const target = await checkedSandboxPath(projectId, directoryPath);
    await fs.mkdir(target, { recursive: true });
    return { success: true, path: directoryPath };
  } catch (error) {
    return { success: false, path: directoryPath, error: { type: "CREATE_DIRECTORY_ERROR", message: error.message } };
  }
}
