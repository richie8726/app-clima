// Netlify Function: weather.js
// ✅ Esta función actúa como puente entre tu front-end y la API de OpenWeather.
// Usa tu variable de entorno WEATHER_API_KEY configurada en Netlify.

import fetch from "node-fetch";

export async function handler(event) {
  try {
    const params = event.queryStringParameters;
    const city = params.city;
    const API_KEY = process.env.WEATHER_API_KEY;

    if (!city) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Debe proporcionar una ciudad." }),
      };
    }

    // Petición al endpoint de clima actual
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`
    );

    if (!weatherResponse.ok) {
      const error = await weatherResponse.json();
      return {
        statusCode: weatherResponse.status,
        body: JSON.stringify({ error }),
      };
    }

    const data = await weatherResponse.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Error en función weather:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno en la función del clima." }),
    };
  }
}
