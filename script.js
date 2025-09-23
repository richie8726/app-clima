async function buscarClima() {
  const ciudad = document.getElementById("ciudadInput").value.trim();
  const resultadoDiv = document.getElementById("resultado");

  if (!ciudad) {
    resultadoDiv.innerHTML = "<p>⚠️ Escribí una ciudad</p>";
    resultadoDiv.classList.add("show");
    return;
  }

  const apiKey = "5b4030d8b631a9d7e10612bad28daaf0";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&lang=es&units=metric`;

  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("❌ Ciudad no encontrada");
    const datos = await respuesta.json();

    const icono = `https://openweathermap.org/img/wn/${datos.weather[0].icon}@2x.png`;

    const resultado = `
      <h2>${datos.name}, ${datos.sys.country}</h2>
      <img src="${icono}" alt="Icono clima">
      <p>🌡 Temperatura: ${datos.main.temp}°C</p>
      <p>☁ Estado: ${datos.weather[0].description}</p>
      <p>💨 Viento: ${datos.wind.speed} m/s</p>
      <p>💧 Humedad: ${datos.main.humidity}%</p>
    `;

    resultadoDiv.innerHTML = resultado;
    resultadoDiv.classList.add("show");
  } catch (error) {
    resultadoDiv.innerHTML = `<p>${error.message}</p>`;
    resultadoDiv.classList.add("show");
  }
}

/* ==== Dark/Light mode ==== */
document.getElementById("modoToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
