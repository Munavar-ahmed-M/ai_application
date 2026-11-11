# AI Static Website Builder Agent

A tool-using AI agent that generates **static HTML, CSS, and vanilla JavaScript websites** from natural-language requests. The backend uses **Node.js**, **Express**, and the **Google Gemini API**. Instead of returning only code in a chat response, the agent calls filesystem tools to create and inspect real files in an isolated *project directory*.

> **Branch covered:** [`chatbot/v1.3`](https://github.com/Munavar-ahmed-M/ai_application/tree/chatbot/v1.3). This README describes the **static website builder** in that branch—not the later React/Vite builder. The project directories are locally restricted workspaces, **not** OS- or container-isolated security sandboxes.

## Contents

- [Overview](#overview)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Architecture and execution flow](#architecture-and-execution-flow)
- [Project structure and important files](#project-structure-and-important-files)
- [How the agent loop works](#how-the-agent-loop-works)
- [Available filesystem tools](#available-filesystem-tools)
- [Installation and configuration](#installation-and-configuration)
- [Run the API](#run-the-api)
- [Run the tests](#run-the-tests)
- [Output and API responses](#output-and-api-responses)
- [Safety and limitations](#safety-and-limitations)
- [Troubleshooting](#troubleshooting)
- [Possible next steps](#possible-next-steps)

## Overview

The application accepts a prompt such as:

> Create a responsive developer portfolio with an about section, skills, projects, and contact information.

The Express API forwards the request to the website agent, which prepares a unique project folder, sends the request and available tool descriptions to Gemini, executes any requested filesystem operations, and sends their results back to Gemini. This **model → tool → observation → model** cycle continues until the model returns a final message or the iteration limit is reached.

Generated projects are stored under `sandbox/<projectId>/` relative to the directory where the Node process starts.

**Current scope:** Create/edit static text files. No React/Vite compilation, package installation, command execution, browser automation, hosted preview, or automatic visual verification is wired into the agent in this branch.

## Features

- Generate basic static websites using natural-language instructions.
- Create a separate project folder for each new API request.
- Create, overwrite, read, list, and delete files through named tools.
- Feed structured tool results back into Gemini as observations.
- Preserve model/tool conversation history across iterations of one agent run.
- Stop after a configurable number of model iterations (default: `20`).
- Return the project ID, completion status, final message, and tool observations.
- Validate relative workspace paths, reject directory traversal, and restrict selected sensitive file paths.
- Test the agent loop with a fake model without spending Gemini API requests.

## Technology stack

| Technology | Role |
| --- | --- |
| Node.js (ES modules) | Backend runtime and filesystem operations |
| Express | HTTP server and `/api/website` endpoint |
| `@google/genai` | Google Gemini API client and function calling |
| `dotenv` | Loads `GEMINI_API_KEY` and optional `PORT` |
| `nodemon` | Restarts the development server on backend source changes |
| `node:fs/promises`, `node:path`, `node:crypto` | Project filesystem, path handling, and generated project IDs |

The configured model in `src/services/gemini.services.js` is `gemini-3.5-flash-lite`. A model's availability and API quota depend on your Google AI project.

## Architecture and execution flow

```text
Client (Postman / Thunder Client / frontend)
          |
          | POST /api/website  { "message": "..." }
          v
src/server.js -> src/app.js -> src/routes/chat.routes.js
          |
          v
src/controllers/chat.controller.js
          |
          v
src/agent/agent.js  [validate request, prepare project, create state]
          |
          v
src/agent/loop.js <------------------------------------------+
          |                                                 |
          v                                                 |
src/services/gemini.services.js                              |
          |  [Gemini returns text and/or function calls]     |
          v                                                 |
src/agent/executor.js                                       |
          |  [resolve allowed tool; insert server projectId] |
          v                                                 |
src/tools/filesystem/*  --->  sandbox/<projectId>/*         |
          |                                                 |
          v                                                 |
Structured tool result -> observation + functionResponse ---+
          |
          +-- when Gemini responds with NO tool calls --> final result
```

**Important:** Gemini does not directly execute Node.js code. Gemini requests a tool by name and arguments; your application decides whether and how to execute it.

## Project structure and important files

The following paths are verified in the linked branch; `sandbox/` is generated at runtime.

```text
ai_application/
├── .gitignore
├── nodemon.json
├── package.json
├── package-lock.json
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   ├── gemini.js
│   │   └── approved-packages.js
│   ├── routes/
│   │   └── chat.routes.js
│   ├── controllers/
│   │   └── chat.controller.js
│   ├── services/
│   │   └── gemini.services.js
│   ├── agent/
│   │   ├── agent.js
│   │   ├── state.js
│   │   ├── loop.js
│   │   ├── executor.js
│   │   └── prompt.js
│   ├── sandbox/
│   │   └── sandbox.manager.js
│   ├── tools/
│   │   ├── index.js
│   │   ├── definations/
│   │   │   └── filesystem-definations.js
│   │   └── filesystem/
│   │       ├── create-file.tool.js
│   │       ├── create-directory.tool.js
│   │       ├── read-file.tool.js
│   │       ├── delete-file.tool.js
│   │       └── list-directory.tool.js
│   └── test/
│       ├── mock-agent.test.js
│       └── test-agent.js
└── sandbox/                 # Created when a project runs; not committed intentionally
    └── project-<uuid>/
        ├── index.html
        ├── style.css
        └── ...
```

### HTTP layer

| File | Responsibility |
| --- | --- |
| `src/server.js` | Loads environment variables, imports the Express app, and listens on `process.env.PORT` or port **5000** by default. |
| `src/app.js` | Creates the Express app, enables JSON request bodies, and mounts the routes under `/api`. |
| `src/routes/chat.routes.js` | Maps `POST /website` to `chatController`; because it is mounted at `/api`, the full endpoint is **`POST /api/website`**. |
| `src/controllers/chat.controller.js` | Validates the `message` field, starts `runAgent`, and returns its result as JSON. Uses a **new project for every request**; errors currently return a generic HTTP 500 response. |

### Model and agent layer

| File | Responsibility |
| --- | --- |
| `src/config/gemini.js` | Creates the `GoogleGenAI` client using `process.env.GEMINI_API_KEY`. |
| `src/services/gemini.services.js` | Exports `generateModelTurn(history, systemPrompt)` to make **one** model request with Gemini tool definitions. Also contains a compatibility wrapper named `generateAIResponse(message)`. |
| `src/agent/agent.js` | Main entry point: validates the prompt, generates/accepts a project ID, ensures the folder exists, creates state, and starts the loop. |
| `src/agent/state.js` | Initializes `projectId`, iteration counter, maximum iterations, running status, Gemini history, and an empty observation list. |
| `src/agent/loop.js` | Repeatedly calls the model, finds tool calls, executes them, stores observations and function responses, then asks the model again. Determines completed/failed/max-iterations status. |
| `src/agent/executor.js` | Maps requested tool names to approved functions. Rejects unknown names or malformed arguments and injects the **server-owned** project ID. |
| `src/agent/prompt.js` | System instructions specific to static website generation. Tells the model to use filesystem tools, honor tool failures, and avoid claiming visual verification. |

### Tool and workspace layer

| File | Responsibility |
| --- | --- |
| `src/tools/index.js` | Registers the five filesystem function declarations provided to Gemini and their matching JavaScript implementations. |
| `src/tools/definations/filesystem-definations.js` | Describes tool names, purposes, parameters, and required arguments for Gemini. The directory spelling `definations` is the spelling present in this branch. |
| `src/tools/filesystem/create-file.tool.js` | Writes UTF-8 text files; rejects content over **256 KiB** and selected protected paths. |
| `src/tools/filesystem/create-directory.tool.js` | Creates directories recursively in the current project. |
| `src/tools/filesystem/read-file.tool.js` | Reads UTF-8 text from regular files up to **256 KiB**. |
| `src/tools/filesystem/delete-file.tool.js` | Removes regular files while blocking selected protected paths. |
| `src/tools/filesystem/list-directory.tool.js` | Lists a directory's immediate children and types; limits listings to **200 entries**. |
| `src/sandbox/sandbox.manager.js` | Generates UUID-based project IDs, makes project directories, checks relative path boundaries, and checks existing path components for symlinks. |
| `src/config/approved-packages.js` | Contains a React/Vite-related package allowlist, **but this static agent does not use it to install packages**. No install/build tool is registered in `src/tools/index.js`. |

### Development and tests

| File | Responsibility |
| --- | --- |
| `src/test/mock-agent.test.js` | Uses a fake Gemini response to verify the create-file tool and observation-to-next-turn loop, then cleans up the test project. |
| `src/test/test-agent.js` | Makes a real Gemini-backed request for a coffee shop website and prints the result. Consumes API quota. |
| `nodemon.json` | Watches `src` for JS/JSON edits and ignores generated sandbox directories and other output folders. |
| `.gitignore` | Currently excludes `node_modules` and `.env`. Consider also ignoring `sandbox/`. |

## How the agent loop works

1. **Initialize:** `runAgent({ userMessage, projectId?, maxIterations? })` creates/validates a project and builds initial state. Each API request currently starts a new project.
2. **Ask Gemini:** `runAgentLoop()` passes the current history and `WEBSITE_AGENT_PROMPT` to `generateModelTurn()`.
3. **Interpret the response:** The loop reads `response.candidates?.[0]?.content` and collects any `parts[].functionCall` values.
4. **Finish or execute:** If there are no function calls, the loop treats the text as its final message and marks the run `completed`. Otherwise, it calls `executeTool()` for each requested function.
5. **Record observations:** Every tool result is added to `state.observations`. A matching Gemini `functionResponse` is also added to the conversation history as a `user`-role content turn.
6. **Repeat:** Gemini receives the updated history on the next iteration, so it can react to actual success/error results. The default model-turn limit is 20.

**Example:**

```text
User: "Build a coffee shop landing page"
Turn 1: Gemini -> list_directory({ path: "." })
        Tool   -> { success: true, items: [] }
Turn 2: Gemini -> create_file({ path: "index.html", content: "..." })
        Tool   -> { success: true, path: "index.html", bytes: ... }
Turn 3: Gemini -> create_file({ path: "style.css", content: "..." })
        Tool   -> { success: true, path: "style.css", bytes: ... }
Turn 4: Gemini -> "Website files created"
        Agent  -> status: completed
```

The loop can process **multiple tool calls in one model turn**; tools are executed sequentially. No-function-call completion indicates **the model stopped requesting tools**, not that the files have been browser-tested or the website is flawless.

## Available filesystem tools

The tool arguments exposed to Gemini **do not include `projectId`**. The executor supplies it from trusted server state.

| Gemini function | Arguments | Result / purpose |
| --- | --- | --- |
| `create_file` | `path`, `content` | Write/overwrite a text file; return success and number of bytes written. |
| `create_directory` | `path` | Make a directory and return success/failure. |
| `read_file` | `path` | Return file contents or structured error. |
| `delete_file` | `path` | Delete a regular file; return success/failure. |
| `list_directory` | `path` | Return child names and types (`file`, `directory`, `other`). Use `"."` for project root. |

All tool implementations return JSON-friendly results. Expected errors are generally returned as `{ success: false, error: { type, message } }`, allowing the model to observe a failure and adjust its next step.

## Installation and configuration

**Requirements:** A supported Node.js version with ES modules, an npm installation, and a Gemini API key with sufficient quota.

```bash
git clone https://github.com/Munavar-ahmed-M/ai_application.git
cd ai_application
git switch chatbot/v1.3
npm install
```

Create a root `.env` file:

```dotenv
GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000
```

**Never commit `.env` or publish your API key.** If `PORT` is omitted, this branch's `src/server.js` defaults to **5000**. The Node import alias `#src/*` is configured in `package.json` to map to `./src/*`.

## Run the API

The committed `package.json` currently defines:

```bash
npm start
```

This runs `nodemon src/server.js`. For a direct run without file-watching/restarts:

```bash
node src/server.js
```

Send a POST request to **`http://localhost:3000/api/website`** (or use port `5000` if `PORT` is unset):

```bash
curl -X POST http://localhost:3000/api/website \
  -H "Content-Type: application/json" \
  -d '{"message":"Create a responsive portfolio website with About, Skills, Projects, and Contact sections. Use HTML and CSS."}'
```

In Postman or Thunder Client, choose `POST`, set `Content-Type: application/json`, and send the same JSON body.

The request is **synchronous**: the HTTP response is sent only after `runAgent()` returns. A large site may require multiple Gemini requests and can take longer than a typical API call.

## Run the tests

### Offline test (no Gemini API key or quota needed)

```bash
node src/test/mock-agent.test.js
```

The mock test asks the agent loop to execute `create_file`, asserts that the next model turn sees a successful `functionResponse`, checks the actual `index.html` content, and removes the temporary project. Expected log:

```text
PASS: Agent observed tool execution and continued to a second model turn.
```

### Live Gemini test (uses your API key/quota)

```bash
node src/test/test-agent.js
```

This runs the hard-coded coffee shop site request in that file, then logs its JSON result. Edit the prompt inside the file to test another site.

## Output and API responses

Successful calls return a structure like:

```json
{
  "success": true,
  "status": "completed",
  "projectId": "project-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "message": "Website files created.",
  "observations": [
    {
      "iteration": 1,
      "tool": "create_file",
      "result": { "success": true, "path": "index.html", "bytes": 1234 }
    }
  ]
}
```

The example is illustrative. File names, tool calls, and model messages vary by request.

Generated files are written to:

```text
sandbox/<projectId>/
```

For a static site, open its `index.html` in a browser and inspect the layout. External fonts/assets may need an internet connection; the current agent does **not** take browser screenshots or validate form submissions.

Current statuses produced by the loop include:

- `completed`: the model returned a response with no function calls.
- `failed`: the model returned no usable content.
- `max_iterations`: the iteration budget was exhausted.

An unhandled Gemini API/network error rejects the agent promise, and the controller currently returns an HTTP 500 with a generic error message.

## Safety and limitations

This branch uses **filesystem path restrictions**, not a security-hardened execution sandbox:

- A project ID is generated with `randomUUID()` and validated before being used in a path.
- Absolute paths and `..` traversal are rejected; existing symlink components are checked.
- `projectId` is injected by the server-side executor rather than trusted from the model.
- `create_file` blocks selected sensitive filenames and caps individual written content at 256 KiB. Reading, listing, and deletion have their own checks/limits.
- **No arbitrary shell tool is registered** in `src/tools/index.js`, even though a separate approved-packages config file exists.

**Do not treat this as secure multitenant isolation.** Filesystem checks can have race conditions and are not a substitute for operating-system/container boundaries. In particular, the source contains no authentication or authorization for existing project IDs, no total workspace quota, no hosted execution isolation, and no content-security review of generated HTML/JavaScript.

Also note:

- The agent can overwrite files within its workspace, and tool-level failures do not necessarily stop subsequent model actions.
- Completion is based on Gemini's response, not a build, browser, or accessibility test.
- Each API request currently creates a new project; there is no documented persistent multi-request editing flow.
- No background job queue or streaming progress endpoint is implemented.
- The current `.gitignore` lists `node_modules` and `.env`; add `sandbox/` before committing generated sites unless intentionally including sample output.

## Troubleshooting

**`429 RESOURCE_EXHAUSTED` from Gemini**  
Your Google API project has reached a rate/quota limit. Check your project's model quotas; remember that one website generation may make multiple Gemini calls.

**Website files exist, but Postman/Thunder Client never gets the result**  
The agent continues after file creation to process the next observation. If the client disconnects or the server restarts during a later Gemini turn, generated files may exist even though no HTTP success was delivered. Run `node src/server.js` without Nodemon as a diagnostic; keep generated `sandbox/` outside watched source folders.

**Nodemon restarts during generation**  
Inspect `nodemon.json`; this branch watches `src` and ignores `sandbox/**`. Make sure generated content really goes to the root `sandbox/` folder rather than `src/`.

**`ERR_MODULE_NOT_FOUND` with `/src/src/` in the path**  
Check the `package.json` import mapping: `"#src/*": "./src/*"`.

**Gemini says it finished, but CSS or links are broken**  
Open the generated `index.html`, confirm relative file references, and check the browser console. This version has no automated browser verification.

**File tool returns `success: false`**  
Inspect the `observations` result. Possible causes include invalid paths, protected filenames, missing files, or file/directory size limits.

## Possible next steps

- A preview server or browser-based preview of generated sites.
- Automatic validation of HTML, CSS links, and generated JavaScript.
- Streaming progress using Server-Sent Events (SSE), plus a persisted job/status system.
- Authenticated access controls and project ownership.
- A stricter isolated runtime (container or VM) before allowing builds or execution of untrusted generated code.
- React/Vite project templates with locked dependencies and a separately authorized build tool.

---

**Source:** [`Munavar-ahmed-M/ai_application`, branch `chatbot/v1.3`](https://github.com/Munavar-ahmed-M/ai_application/tree/chatbot/v1.3). This README documents the inspected source for that branch; it does not claim that every generated website has been visually or functionally tested.
