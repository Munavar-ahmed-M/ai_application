import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const SANDBOX_ROOT = path.resolve(process.cwd(), "sandbox");
const PROJECT_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export function getSandboxPath(projectId) {
  if (typeof projectId !== "string" || !PROJECT_ID_PATTERN.test(projectId)) {
    throw new Error("Invalid project ID");
  }
  return path.join(SANDBOX_ROOT, projectId);
}

// Syntactic restriction; additionally check existing symlinks below.
export function resolveSandboxPath(projectId, relativePath) {
  const root = getSandboxPath(projectId);
  if (
    typeof relativePath !== "string" ||
    !relativePath ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("A nonempty relative path is required");
  }
  // Reject both platform-specific separators, drive prefixes and traversal.
  const normalized = relativePath.replace(/\\/g, "/");
  if (
    /^[a-zA-Z]:/.test(normalized) ||
    normalized.startsWith("/") ||
    normalized.split("/").some((x) => x === "..")
  ) {
    throw new Error("Path traversal is not allowed");
  }
  const target = path.resolve(root, normalized);
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error("Access outside the sandbox is not allowed");
  }
  return target;
}

export async function ensureSandbox(projectId) {
  await fs.mkdir(SANDBOX_ROOT, { recursive: true });
  const root = getSandboxPath(projectId);
  await fs.mkdir(root, { recursive: true });
  if (!(await fs.lstat(root)).isDirectory())
    throw new Error("Invalid project root");
  return root;
}

// For local, trusted development. This is not a substitute for OS/container isolation.
export async function checkedSandboxPath(projectId, relativePath) {
  const root = await ensureSandbox(projectId);
  const target = resolveSandboxPath(projectId, relativePath);
  const rel = path.relative(root, target);
  let current = root;
  for (const part of rel.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      const stat = await fs.lstat(current);
      if (stat.isSymbolicLink())
        throw new Error("Symlinks are not allowed in sandbox paths");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return target;
}

export function newProjectId() {
  return `project-${randomUUID()}`;
}
