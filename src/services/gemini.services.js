import ai from "#src/config/gemini.js";

export async function generateAIResponse(message) {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: message,
  });

  return response.text;
}
