const fetch = require("node-fetch");

exports.handler = async (event) => {
  const API_KEY = process.env.WEATHER_API_KEY;
  const { city } = event.queryStringParameters;

  if (!city) return { statusCode: 400, body: JSON.stringify({ error: "Falta el parámetro city" }) };

  try {
    const url = city.includes(",")
      ? `https://api.openweathermap.org/data/2.5/forecast?lat=${city.split(",")[0]}&lon=${city.split(",")[1]}&appid=${API_KEY}&units=metric&lang=es`
      : `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`;

    const res = await fetch(url);
    const data = await res.json();

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
