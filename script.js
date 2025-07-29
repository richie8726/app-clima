async function buscarClima() {
  const ciudad = document.getElementById("ciudadInput").value;
  const apiKey = "5b4030d8b631a9d7e10612bad28daaf0";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&lang=es&units=metric`;

  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("Ciudad no encontrada");
    const datos = await respuesta.json();

    const resultado = `
      <h2>${datos.name}, ${datos.sys.country}</h2>
      <p>🌡 Temperatura: ${datos.main.temp}°C</p>
      <p>☁ Estado: ${datos.weather[0].description}</p>
      <p>💨 Viento: ${datos.wind.speed} m/s</p>
    `;

    document.getElementById("resultado").innerHTML = resultado;
  } catch (error) {
    document.getElementById("resultado").innerHTML = `<p>${error.message}</p>`;
  }
}
