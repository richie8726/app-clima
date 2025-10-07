// script.js

const apiBase = "/.netlify/functions/weather";
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const icon = document.getElementById("icon");
const forecastDiv = document.getElementById("forecast");
const bgSvg = document.getElementById("background-svg");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

async function getWeather(city) {
  try {
    const res = await fetch(`${apiBase}?city=${city}`);
    const data = await res.json();

    if (data.error) {
      cityName.textContent = "Ciudad no encontrada";
      temperature.textContent = "";
      description.textContent = "";
      forecastDiv.innerHTML = "";
      bgSvg.innerHTML = "";
      return;
    }

    showCurrentWeather(data.current);
    showForecast(data.forecast);
  } catch (err) {
    console.error("Error obteniendo datos del clima:", err);
  }
}

function showCurrentWeather(current) {
  if (!current || !current.main) {
    cityName.textContent = "Datos del clima no disponibles";
    return;
  }

  cityName.textContent = current.name;
  temperature.textContent = `${Math.round(current.main.temp)}°C`;
  description.textContent = current.weather[0].description;
  icon.innerHTML = `<img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="icono">`;

  updateBackground(current.weather[0].main);
}

function showForecast(forecast) {
  if (!forecast || !forecast.list) return;
  forecastDiv.innerHTML = "";

  const daily = forecast.list.filter((item) => item.dt_txt.includes("12:00:00"));
  daily.slice(0, 5).forEach((day) => {
    const date = new Date(day.dt_txt).toLocaleDateString("es-ES", { weekday: "short" });
    forecastDiv.innerHTML += `
      <div class="day">
        <span>${date}</span>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="">
        <span>${Math.round(day.main.temp)}°C</span>
      </div>`;
  });
}

// Fondo SVG dinámico según el clima
function updateBackground(condition) {
  let svg = "";
  let gradient = "";

  switch (condition.toLowerCase()) {
    case "clear":
      gradient = "linear-gradient(to bottom, #f9d423, #ff4e50)";
      svg = `<svg class="sun"><circle cx="50" cy="50" r="30"/></svg>`;
      break;
    case "clouds":
      gradient = "linear-gradient(to bottom, #757f9a, #d7dde8)";
      svg = `<svg class="clouds"><ellipse cx="60" cy="50" rx="40" ry="20"/></svg>`;
      break;
    case "rain":
      gradient = "linear-gradient(to bottom, #00c6fb, #005bea)";
      svg = `<svg class="rain">
        <line x1="30" y1="60" x2="30" y2="80"/>
        <line x1="50" y1="60" x2="50" y2="80"/>
        <line x1="70" y1="60" x2="70" y2="80"/>
      </svg>`;
      break;
    default:
      gradient = "linear-gradient(to bottom, #83a4d4, #b6fbff)";
  }

  document.body.style.background = gradient;
  bgSvg.innerHTML = svg;
}
