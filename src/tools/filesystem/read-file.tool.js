import fs from "node:fs/promises";
import { checkedSandboxPath } from "../../sandbox/sandbox.manager.js";
export async function readFile({ projectId, path: filePath }) {
  try {
    const target = await checkedSandboxPath(projectId, filePath);
    const stat = await fs.stat(target);
    if (!stat.isFile() || stat.size > 256 * 1024) throw new Error("Not a readable text file or file too large");
    return { success: true, path: filePath, content: await fs.readFile(target, "utf8") };
  } catch (error) {
    return { success: false, path: filePath, error: { type: "READ_FILE_ERROR", message: error.message } };
  }
}
