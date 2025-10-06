const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const city = event.queryStringParameters.city;
  const API_KEY = process.env.API_KEY;

  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "City parameter missing" })
    };
  }

  try {
    // Clima actual
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const currentData = await currentRes.json();

    // Pronóstico extendido 5 días
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const forecastData = await forecastRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        current: currentData,
        forecast: forecastData
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching weather data" })
    };
  }
};
