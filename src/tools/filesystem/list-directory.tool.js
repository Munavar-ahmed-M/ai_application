import fs from "node:fs/promises";
import { checkedSandboxPath } from "../../sandbox/sandbox.manager.js";
export async function listDirectory({ projectId, path: directoryPath = "." }) {
  try {
    const target = await checkedSandboxPath(projectId, directoryPath);
    const entries = await fs.readdir(target, { withFileTypes: true });
    if (entries.length > 200) throw new Error("Too many directory entries");
    return { success: true, path: directoryPath, items: entries.map(e => ({ name: e.name, type: e.isDirectory() ? "directory" : e.isFile() ? "file" : "other" })) };
  } catch (error) {
    return { success: false, path: directoryPath, error: { type: "LIST_DIRECTORY_ERROR", message: error.message } };
  }
}
