// netlify/functions/weather.js
const fetch = require("node-fetch"); // usamos v2, compatible con Netlify

exports.handler = async (event) => {
  try {
    const API_KEY = process.env.WEATHER_API_KEY; // tu API Key como variable de entorno
    const { city, lat, lon } = event.queryStringParameters;

    if (!city && (!lat || !lon)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Falta el parámetro 'city' o 'lat/lon'" }),
      };
    }

    // Construir URL según parámetros
    let weatherUrl;
    let forecastUrl;

    if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric&lang=es`;

      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric&lang=es`;
    } else {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;

      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
    }

    // Pedir datos actuales
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error(`Error en Weather API: ${weatherRes.statusText}`);
    const current = await weatherRes.json();

    // Pedir pronóstico extendido
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) throw new Error(`Error en Forecast API: ${forecastRes.statusText}`);
    const forecast = await forecastRes.json();

    // Estructura de respuesta consistente con script.js
    return {
      statusCode: 200,
      body: JSON.stringify({
        current,
        forecast: forecast.list || [],
        alerts: forecast.alerts || [],
      }),
    };
  } catch (error) {
    console.error("Error en la función weather.js:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al obtener el clima" }),
    };
  }
};
