import { getWeather } from "#src/tools/weather.tool.js";
import { weatherTool } from "#src/tools/weather.defination.js";
import { currencyTool } from "#src/tools/currency.defination.js";
import { convertCurrency } from "#src/tools/currency.tool.js";

export const toolDefinitions = [
  {
    functionDeclarations: [weatherTool, currencyTool],
  },
];

export const toolFunctions = {
  get_weather: getWeather,
  convert_currency: convertCurrency,
};
