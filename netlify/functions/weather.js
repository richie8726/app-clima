const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const city = event.queryStringParameters.city;
  const API_KEY = process.env.WEATHER_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API_KEY no definida en Netlify" }),
    };
  }

  let url = "";

  // Si la ciudad viene como lat,lng
  if (city.includes(",")) {
    const [lat, lon] = city.split(",");
    url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`;
  } else {
    // Primero obtener coordenadas por nombre de ciudad
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Ciudad no encontrada" }),
      };
    }

    const { lat, lon } = geoData[0];
    url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Devolver solo lo necesario
    const result = {
      current: data.current,
      daily: data.daily,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al obtener el clima" }),
    };
  }
};

