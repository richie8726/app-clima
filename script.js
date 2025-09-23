// 🔑 API Key
const apiKey = "c1a81dc307812b188809c6b0153de3a1";

// 🔎 Buscar clima
async function buscarClima(ciudad) {
  if (!ciudad) ciudad = document.getElementById("ciudadInput").value;
  if (!ciudad) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&lang=es&units=metric`;

  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("Ciudad no encontrada");
    const datos = await respuesta.json();

    mostrarClima(datos);
    guardarBusqueda(ciudad);
    buscarForecast(ciudad);

  } catch (error) {
    document.getElementById("resultado").innerHTML = `<p>${error.message}</p>`;
  }
}

// 📊 Mostrar clima actual
function mostrarClima(datos) {
  const icono = obtenerIcono(datos.weather[0].main);

  const resultado = `
    <div class="result-card">
      <h2>${datos.name}, ${datos.sys.country}</h2>
      <i class="wi ${icono} weather-icon"></i>
      <p>🌡 Temperatura: ${datos.main.temp}°C</p>
      <p>☁ Estado: ${datos.weather[0].description}</p>
      <p>💨 Viento: ${datos.wind.speed} m/s</p>
    </div>
  `;

  document.getElementById("resultado").innerHTML = resultado;
}

// 📅 Pronóstico 5 días
async function buscarForecast(ciudad) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${apiKey}&lang=es&units=metric`;

  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("No se pudo obtener pronóstico");
    const datos = await respuesta.json();

    let forecastHTML = "";
    const dias = {};

    datos.list.forEach(item => {
      const fecha = item.dt_txt.split(" ")[0];
      if (!dias[fecha] && Object.keys(dias).length < 5) {
        dias[fecha] = item;
        const icono = obtenerIcono(item.weather[0].main);

        forecastHTML += `
          <div class="forecast-card">
            <h4>${fecha}</h4>
            <i class="wi ${icono} weather-icon"></i>
            <p>${item.main.temp}°C</p>
          </div>
        `;
      }
    });

    document.getElementById("forecast").innerHTML = forecastHTML;

  } catch (error) {
    document.getElementById("forecast").innerHTML = `<p>${error.message}</p>`;
  }
}

// 📍 Geolocalización
function buscarPorUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=es&units=metric`;

      try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error("No se pudo obtener ubicación");
        const datos = await respuesta.json();

        mostrarClima(datos);
        guardarBusqueda(datos.name);
        buscarForecast(datos.name);

      } catch (error) {
        document.getElementById("resultado").innerHTML = `<p>${error.message}</p>`;
      }
    });
  } else {
    document.getElementById("resultado").innerHTML = "<p>La geolocalización no está soportada.</p>";
  }
}

// 🎨 Íconos
function obtenerIcono(clima) {
  switch (clima.toLowerCase()) {
    case "clear": return "wi-day-sunny";
    case "clouds": return "wi-cloudy";
    case "rain": return "wi-rain";
    case "drizzle": return "wi-sprinkle";
    case "thunderstorm": return "wi-thunderstorm";
    case "snow": return "wi-snow";
    case "mist":
    case "fog": return "wi-fog";
    default: return "wi-day-cloudy";
  }
}

// 💾 Guardar búsquedas
function guardarBusqueda(ciudad) {
  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  if (!historial.includes(ciudad)) {
    historial.unshift(ciudad);
    if (historial.length > 5) historial.pop();
    localStorage.setItem("historial", JSON.stringify(historial));
  }
  mostrarHistorial();
}

// 📜 Mostrar historial
function mostrarHistorial() {
  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  const lista = historial.map(c => `<li onclick="buscarClima('${c}')">${c}</li>`).join("");
  document.getElementById("historial").innerHTML = lista;
}

// 🚀 Inicializar
mostrarHistorial();
