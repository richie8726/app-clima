// script.js

const apiBase = "/.netlify/functions/weather"; // función Netlify

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");

// Buscar por ciudad
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city === "") {
    alert("Por favor, ingresa una ciudad");
    return;
  }

  getWeatherByCity(city);
});

// Buscar por geolocalización
document.getElementById("geoBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.error(error);
        alert("No se pudo obtener tu ubicación");
      }
    );
  } else {
    alert("La geolocalización no es soportada por este navegador.");
  }
});

// --- Funciones auxiliares ---

function getWeatherByCity(city) {
  const url = `${apiBase}?city=${encodeURIComponent(city)}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => renderWeather(data))
    .catch((err) => console.error("Error:", err));
}

function getWeatherByCoords(lat, lon) {
  const url = `${apiBase}?lat=${lat}&lon=${lon}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => renderWeather(data))
    .catch((err) => console.error("Error:", err));
}

function renderWeather(data) {
  if (!data || data.error) {
    weatherResult.innerHTML = `<p>No se encontró información del clima.</p>`;
    return;
  }

  const current = data.current;
  const forecast = data.forecast;

  weatherResult.innerHTML = `
    <h2>Clima en ${current.name}</h2>
    <p><strong>Temperatura:</strong> ${current.main.temp}°C</p>
    <p><strong>Humedad:</strong> ${current.main.humidity}%</p>
    <p><strong>Condición:</strong> ${current.weather[0].description}</p>

    <h3>Pronóstico</h3>
    <ul>
      ${forecast
        .slice(0, 5)
        .map(
          (item) => `
        <li>
          ${new Date(item.dt * 1000).toLocaleString()}: 
          ${item.main.temp}°C, ${item.weather[0].description}
        </li>`
        )
        .join("")}
    </ul>
  `;
}
