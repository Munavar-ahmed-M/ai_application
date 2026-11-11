import fs from "node:fs/promises";
import path from "node:path";
import { checkedSandboxPath } from "../../sandbox/sandbox.manager.js";

const MAX_FILE_BYTES = 256 * 1024;
const PROTECTED = new Set(["package.json", "package-lock.json", "npm-shrinkwrap.json", ".env", ".env.local", "vite.config.js", "vite.config.ts"]);

export async function createFile({ projectId, path: filePath, content }) {
  try {
    if (typeof content !== "string") throw new Error("File content must be text");
    if (Buffer.byteLength(content, "utf8") > MAX_FILE_BYTES) throw new Error("File too large");
    const normalized = filePath.replace(/\\/g, "/");
    if (PROTECTED.has(normalized) || normalized.split("/").some(x => x === "node_modules" || x === ".git" || x.startsWith(".env"))) {
      throw new Error("Agent cannot modify protected project files");
    }
    const fullPath = await checkedSandboxPath(projectId, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    // Exclusive symlink protection for existing target; local prototype only.
    await fs.writeFile(fullPath, content, { encoding: "utf8", flag: "w" });
    return { success: true, path: filePath, bytes: Buffer.byteLength(content, "utf8") };
  } catch (error) {
    return { success: false, path: filePath, error: { type: "WRITE_FILE_ERROR", message: error.message } };
  }
}
