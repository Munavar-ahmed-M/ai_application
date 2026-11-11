import ai from "#src/config/gemini.js";
import { toolDefinitions, toolFunctions } from "#src/tools/index.js";

const systemPrompt = `
You are a helpful AI assistant.

Rules:
- use the tools provided to you when necessary.
- for wheather tool reply with the weather information in a human readable format.

constraints:
- dont exceed more than 2 lines in your response.
`;

const conversation = {
  history: [],
};

export async function generateAIResponse(message) {
  conversation.history.push({
    role: "user",
    parts: [{ text: message }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash", // Update to your SDK's supported model
    contents: conversation.history,
    config: {
      systemInstruction: systemPrompt,
      tools: toolDefinitions,
    },
  });

  const functionCalls = response.functionCalls;

  // Handle case where model does not call a tool
  if (!functionCalls || functionCalls.length === 0) {
    const textResponse = response.text;
    conversation.history.push({
      role: "model",
      parts: [{ text: textResponse }],
    });
    return textResponse;
  }

  // Handle tool execution
  const functionCall = functionCalls[0];
  console.log("Tool requested:", functionCall.name);
  console.log("Arguments:", functionCall.args);

  const functionName = functionCall.name;
  const functionArgs = functionCall.args;
  const toolFunction = toolFunctions[functionName];
  console.log(functionName, functionArgs, toolFunction);
  if (!toolFunction) {
    throw new Error(`Tool function ${functionName} not found.`);
  }

  // Pass arguments dynamically (or spread if your tool accepts an object)
  const result = await toolFunction(functionArgs);

  // Push model's function call turn and tool response to history
  conversation.history.push(response.candidates[0].content);
  conversation.history.push({
    role: "user",
    parts: [
      {
        functionResponse: {
          name: functionCall.name,
          response: result,
          id: functionCall.id,
        },
      },
    ],
  });

  // Ask Gemini to produce final answer using the updated history
  const finalResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: conversation.history,
    config: {
      systemInstruction: systemPrompt,
      tools: toolDefinitions,
    },
  });

  console.log("Tool result:", result);

  conversation.history.push({
    role: "model",
    parts: [{ text: finalResponse.text }],
  });

  const metadata = response.usageMetadata;
  if (metadata) {
    console.log("--- Token Consumption Breakdown ---");
    console.log(`Prompt (Input) Tokens: ${metadata.promptTokenCount}`);
    console.log(`Candidates (Output) Tokens: ${metadata.candidatesTokenCount}`);
    console.log(`Total Tokens Spent: ${metadata.totalTokenCount}`);
  }

  return finalResponse.text;
}
