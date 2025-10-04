const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const API_KEY = process.env.WEATHER_API_KEY;
    const { city } = event.queryStringParameters;

    if (!city) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Falta el parámetro 'city'" }),
      };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric&lang=es`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error API: ${response.statusText}`);
    const current = await response.json();

    // Pronóstico extendido
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric&lang=es`
    );
    const forecast = await forecastRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        current,
        forecast: forecast.list,
      }),
    };
  } catch (error) {
    console.error("Error en weather.js:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al obtener el clima" }),
    };
  }
};
