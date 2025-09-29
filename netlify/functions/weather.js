// netlify/functions/weather.js
const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const API_KEY = process.env.WEATHER_API_KEY; // viene de las variables en Netlify
  const { city } = event.queryStringParameters;

  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta el parámetro 'city'" }),
    };
  }

  try {
    // Clima actual
    const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`;

    // Pronóstico extendido 5 días
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherURL),
      fetch(forecastURL),
    ]);

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        current: currentData,
        forecast: forecastData,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error obteniendo datos", details: err }),
    };
  }
};
