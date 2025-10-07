// netlify/functions/weather.js
import fetch from "node-fetch";

export const handler = async (event) => {
  const API_KEY = process.env.API_KEY;
  const { city } = event.queryStringParameters;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Falta la API_KEY en las variables de entorno." }),
    };
  }

  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No se especificó ninguna ciudad." }),
    };
  }

  try {
    // Llamado a OpenWeatherMap (clima actual + pronóstico)
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${API_KEY}`
    );
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=es&appid=${API_KEY}`
    );

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    // Validación de respuesta
    if (current.cod !== 200) {
      return {
        statusCode: current.cod,
        body: JSON.stringify({ error: current.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ current, forecast }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error obteniendo datos del clima", details: err.message }),
    };
  }
};
