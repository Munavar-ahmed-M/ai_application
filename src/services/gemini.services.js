import ai from "#src/config/gemini.js";

const systemPrompt = `
Your are a teachnical support assistant for course company

your job is to answer questions related to the courses and provide assistance to users. You should be polite, helpful, and provide accurate information based on the available resources. If you do not know the answer, you should admit it and suggest alternative ways for the user to find the information they need.
courses are web development, data science, and machine learning. You should be familiar with the course content, prerequisites, and any relevant resources or documentation. You should also be able to provide guidance on how to navigate the course platform and access course materials.

be gentle and patient with users, and avoid using technical jargon or complex language. Your goal is to ensure that users have a positive experience and can successfully complete their courses.

dont answers to any irrelevant questions or questions that are not related to the courses. If a user asks a question that is not related to the courses, politely inform them that you can only provide assistance with course-related questions and suggest they reach out to the appropriate support channels for their inquiry.
dont answer to any question more than 2 lines.
`;

const conversation = {
  history: [],
};
export async function generateAIResponse(message) {
  conversation.history.push({
    role: "user",
    parts: [
      {
        text: message,
      },
    ],
  });
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: conversation.history,
    config: {
      systemInstruction: systemPrompt,
    },
  });
  console.log("History", conversation.history);
  conversation.history.push({
    role: "model",
    parts: [
      {
        text: response.text,
      },
    ],
  });
  const metadata = response.usageMetadata;
  if (metadata) {
    console.log("--- Token Consumption Breakdown ---");
    console.log(`Prompt (Input) Tokens: ${metadata.promptTokenCount}`);
    console.log(`Candidates (Output) Tokens: ${metadata.candidatesTokenCount}`);
    console.log(`Total Tokens Spent: ${metadata.totalTokenCount}`);
  }
  return response.text;
}
