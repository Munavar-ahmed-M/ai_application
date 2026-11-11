export async function getWeather({ city }) {
  console.log("Weather tool called for:", city);

  // 1. Convert city name → latitude/longitude
  const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
  );

  const geoData = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    return {
      error: `Could not find the city: ${city}`,
    };
  }

  const location = geoData.results[0];

  // 2. Get weather using latitude/longitude
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`,
  );

  const weatherData = await weatherResponse.json();

  return {
    city: location.name,
    country: location.country,

    temperature: weatherData.current.temperature_2m,
    apparentTemperature: weatherData.current.apparent_temperature,
    humidity: weatherData.current.relative_humidity_2m,
    precipitation: weatherData.current.precipitation,
    windSpeed: weatherData.current.wind_speed_10m,
    weatherCode: weatherData.current.weather_code,
  };
}
