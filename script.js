// script.js

const apiBase = "/.netlify/functions/weather";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const weatherResult = document.getElementById("weatherResult");
const forecastSection = document.getElementById("forecast");
const forecastGrid = document.getElementById("forecastGrid");
const alertBox = document.getElementById("alertBox");

// Evento búsqueda por ciudad
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Ingresa una ciudad");
    return;
  }
  fetchWeather({ city });
});

// Evento geolocalización
geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather({ lat: latitude, lon: longitude });
      },
      (err) => {
        console.error("Error geolocalización:", err);
        alert("No se pudo obtener tu ubicación");
      }
    );
  } else {
    alert("Geolocalización no soportada");
  }
});

async function fetchWeather({ city, lat, lon }) {
  try {
    let url = apiBase;
    if (city) {
      url += `?city=${encodeURIComponent(city)}`;
    } else if (lat != null && lon != null) {
      url += `?lat=${lat}&lon=${lon}`;
    } else {
      alert("Parámetros inválidos");
      return;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    displayWeather(data);
  } catch (err) {
    console.error("Error en fetchWeather:", err);
    alertBox.textContent = err.message || "Error de configuración";
    alertBox.classList.remove("hidden");
  }
}

function displayWeather(data) {
  // Ocultar alert box si estaba visible
  alertBox.classList.add("hidden");

  const { current, forecast } = data;

  // Mostrar clima actual
  weatherResult.innerHTML = `
    <h2>${current.name}</h2>
    <p>${current.weather[0].description}</p>
    <p>🌡️ ${Math.round(current.main.temp)}°C</p>
    <p>💧 Humedad: ${current.main.humidity}%</p>
  `;

  // Mostrar pronóstico (hasta 5)
  if (forecast && Array.isArray(forecast) && forecast.length > 0) {
    forecastSection.classList.remove("hidden");
    forecastGrid.innerHTML = "";
    forecast.slice(0, 5).forEach((it) => {
      const date = new Date(it.dt * 1000);
      const day = date.toLocaleDateString("es-ES", { weekday: "short" });
      forecastGrid.innerHTML += `
        <div class="forecast-item">
          <p>${day}</p>
          <img src="https://openweathermap.org/img/wn/${it.weather[0].icon}@2x.png" alt="icon">
          <p>${Math.round(it.main.temp)}°C</p>
        </div>
      `;
    });
  } else {
    forecastSection.classList.add("hidden");
  }
}
