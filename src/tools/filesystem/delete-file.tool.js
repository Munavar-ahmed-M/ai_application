import fs from "node:fs/promises";
import { checkedSandboxPath } from "../../sandbox/sandbox.manager.js";
const PROTECTED = /(^|\/)(package(-lock)?\.json|npm-shrinkwrap\.json|\.env(?:\..*)?|vite\.config\.[jt]s|node_modules|\.git)(\/|$)/;
export async function deleteFile({ projectId, path: filePath }) {
  try {
    if (PROTECTED.test(filePath.replace(/\\/g, "/"))) throw new Error("Protected file");
    const target = await checkedSandboxPath(projectId, filePath);
    if (!(await fs.stat(target)).isFile()) throw new Error("Only regular files may be deleted");
    await fs.unlink(target);
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, path: filePath, error: { type: "DELETE_FILE_ERROR", message: error.message } };
  }
}
