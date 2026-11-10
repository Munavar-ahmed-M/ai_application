import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents:
      "Explain artificial intelligence like I'm 10 years old in 2 lines",
  });

  console.log(response.text);
}

main();
