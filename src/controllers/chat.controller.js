// Adapt this example to your existing Express router.
import { runAgent } from "#src/agent/agent.js";

export async function chatController(req, res) {
  try {
    const { message } = req.body ?? {};
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    // New project each request for now. Persist server-owned project IDs later.
    const result = await runAgent({ userMessage: message });
    console.log("Agent finished:", result.status);
    let responseFinished = false;
    res.on("finish", () => {
      responseFinished = true;
      console.log("HTTP response sent successfully");
    });
    res.on("close", () => {
      if (!responseFinished) {
        console.warn("HTTP connection closed before the response finished");
      }
    });

    return res.json(result);
  } catch (error) {
    console.error("Agent error:", error);
    return res.status(500).json({ error: "Agent failed" });
  }
}
