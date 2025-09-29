// netlify/functions/weather.js
const fetch = require("node-fetch"); // usamos v2, compatible con Netlify

exports.handler = async (event) => {
  try {
    const API_KEY = process.env.WEATHER_API_KEY; // tu API Key como variable de entorno
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

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error en la función weather.js:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al obtener el clima" }),
    };
  }
};
