// Deliberately retain the 'definations' spelling used by your existing imports.
// projectId is not requested from the model: the server supplies it securely.
function fileTool(name, description, properties, required) {
  return { name, description, parameters: { type: "object", properties, required } };
}
const filePath = { type: "string", description: "Relative path inside the current project; no absolute paths or '..'" };
export const createFileTool = fileTool("create_file", "Create or overwrite a text file for the website; never write package.json or other configuration files.", { path: filePath, content: { type: "string", description: "Complete UTF-8 contents" } }, ["path", "content"]);
export const createDirectoryTool = fileTool("create_directory", "Create a folder in the current project.", { path: filePath }, ["path"]);
export const readFileTool = fileTool("read_file", "Read a text file in the current project.", { path: filePath }, ["path"]);
export const deleteFileTool = fileTool("delete_file", "Delete an unnecessary regular file in the current project.", { path: filePath }, ["path"]);
export const listDirectoryTool = fileTool("list_directory", "List files in a directory. Use '.' for the project root.", { path: filePath }, ["path"]);
