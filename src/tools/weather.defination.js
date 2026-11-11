export const weatherTool = {
  name: "get_weather",

  description: "Get the current weather information for a city.",

  parameters: {
    type: "object",

    properties: {
      city: {
        type: "string",
        description: "The name of the city",
      },
    },

    required: ["city"],
  },
};
