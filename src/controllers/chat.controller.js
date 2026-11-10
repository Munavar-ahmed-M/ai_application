import { generateAIResponse } from "#src/services/gemini.services.js";

export async function chatController(req, res) {
  try {
    const { message } = req.body;
    console.log("Received message:", message);
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const reply = await generateAIResponse(message);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Chat error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
