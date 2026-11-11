export const currencyTool = {
  name: "convert_currency",

  description:
    "Convert an amount from one currency to another using the latest exchange rate.",

  parameters: {
    type: "object",

    properties: {
      from: {
        type: "string",
        description: "Three-letter source currency code, for example USD",
      },

      to: {
        type: "string",
        description: "Three-letter target currency code, for example INR",
      },

      amount: {
        type: "number",
        description: "Amount of money to convert",
      },
    },

    required: ["from", "to", "amount"],
  },
};
