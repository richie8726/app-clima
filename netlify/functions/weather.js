// netlify/functions/weather.js
const fetch = require("node-fetch");

exports.handler = async function (event) {
  const query = event.queryStringParameters || {};
  const city = query.city || "";
  // check both possible env var names for compatibility
  const API_KEY = process.env.API_KEY || process.env.WEATHER_API_KEY || process.env.APIKEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key no configurada en Netlify. Añadir API_KEY o WEATHER_API_KEY." })
    };
  }

  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta parámetro city" })
    };
  }

  try {
    // current weather
    const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=es&appid=${API_KEY}`);
    const current = await currentRes.json();
    // forecast 5-day (3hr steps)
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=es&appid=${API_KEY}`);
    const forecast = await forecastRes.json();

    if (current.cod && current.cod !== 200) {
      return { statusCode: current.cod || 500, body: JSON.stringify({ error: current.message || 'Error al obtener clima actual' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ current, forecast })
    };
  } catch (err) {
    console.error("weather function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Error interno al obtener datos de OpenWeather" }) };
  }
};
