import { createFile } from "./filesystem/create-file.tool.js";
import { createDirectory } from "./filesystem/create-directory.tool.js";
import { readFile } from "./filesystem/read-file.tool.js";
import { deleteFile } from "./filesystem/delete-file.tool.js";
import { listDirectory } from "./filesystem/list-directory.tool.js";
import { createFileTool, createDirectoryTool, readFileTool, deleteFileTool, listDirectoryTool } from "./definations/filesystem-definations.js";

// Google GenAI expects a list of tool objects, each containing functionDeclarations.
export const toolDefinitions = [{ functionDeclarations: [
  createFileTool,
  createDirectoryTool,
  readFileTool,
  deleteFileTool,
  listDirectoryTool,
] }];

export const toolFunctions = {
  create_file: createFile,
  create_directory: createDirectory,
  read_file: readFile,
  delete_file: deleteFile,
  list_directory: listDirectory,
};
