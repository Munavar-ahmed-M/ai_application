import { getWeather } from "#src/tools/weather.tool.js";

const result = await getWeather("Chennai");

console.log(result);
