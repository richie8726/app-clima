const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const weatherContainer = document.getElementById("weather-container");
const forecastContainer = document.getElementById("forecast-container");
const toggleThemeBtn = document.getElementById("toggle-theme");

let isNightMode = false;

// ✅ Nueva ruta limpia gracias a netlify.toml
const API_URL = "/api/weather?city=";

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (!city) return;

  try {
    const res = await fetch(API_URL + encodeURIComponent(city));
    if (!res.ok) throw new Error("Error al obtener datos del clima");

    const data = await res.json();
    renderWeather(data.current);
    renderForecast(data.forecast);
  } catch (err) {
    weatherContainer.innerHTML = `<p class="error">⚠️ No se pudo obtener el clima. Intenta nuevamente.</p>`;
    console.error(err);
  }
});

function renderWeather(current) {
  weatherContainer.innerHTML = `
    <div class="weather-card">
      <h2>${current.name}, ${current.sys.country}</h2>
      <p class="temp">${Math.round(current.main.temp)}°C</p>
      <p>${current.weather[0].description}</p>
      <p>🌡️ Máx: ${Math.round(current.main.temp_max)}°C | Mín: ${Math.round(current.main.temp_min)}°C</p>
      <p>💧 Humedad: ${current.main.humidity}%</p>
    </div>
  `;
}

function renderForecast(forecast) {
  forecastContainer.innerHTML = forecast
    .slice(0, 5)
    .map((day) => {
      const date = new Date(day.dt_txt).toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "short",
      });
      return `
        <div class="forecast-card">
          <h3>${date}</h3>
          <p>${Math.round(day.main.temp)}°C</p>
          <p>${day.weather[0].description}</p>
        </div>
      `;
    })
    .join("");
}

// 🌙/☀️ Alternar tema
toggleThemeBtn.addEventListener("click", () => {
  isNightMode = !isNightMode;
  document.body.classList.toggle("night-mode", isNightMode);
});
