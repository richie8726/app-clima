const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const details = document.getElementById("details");
const forecastContainer = document.getElementById("forecast");
const modeToggle = document.getElementById("mode-toggle");

// Cambiar favicon dinámicamente
const favicon = document.querySelector("link[rel='icon']");

function setFavicon(night = false) {
  if (night) {
    favicon.href = "data:image/svg+xml," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <circle cx="40" cy="24" r="14" fill="#C0C0C0"/>
      </svg>
    `);
  } else {
    favicon.href = "data:image/svg+xml," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="14" fill="#FFD93B"/>
      </svg>
    `);
  }
}

// Cambiar modo día/noche
modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("night-mode");
  if (document.body.classList.contains("night-mode")) {
    modeToggle.textContent = "☀️";
    setFavicon(true);
  } else {
    modeToggle.textContent = "🌙";
    setFavicon(false);
  }
});

// Clima actual
async function getWeather(city) {
  try {
    let response = await fetch(`/.netlify/functions/weather?city=${city}`);
    let data;

    if (response.ok) {
      data = await response.json();
    } else {
      // fallback local con config.js
      response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
      data = await response.json();
    }

    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    details.textContent = `🌡️ Máx: ${Math.round(data.main.temp_max)}°C | Mín: ${Math.round(data.main.temp_min)}°C 
    💧 Humedad: ${data.main.humidity}%`;

    getForecast(city);
  } catch (error) {
    cityName.textContent = "Error";
    description.textContent = "No se pudo obtener el clima.";
    console.error(error);
  }
}

// Pronóstico extendido
async function getForecast(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
    const data = await response.json();

    forecastContainer.innerHTML = "";
    const daily = {};

    data.list.forEach(item => {
      const date = new Date(item.dt_txt).toLocaleDateString("es-ES", { weekday: "long" });
      if (!daily[date]) daily[date] = item;
    });

    Object.keys(daily).slice(0, 5).forEach(day => {
      const item = daily[day];
      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = `
        <h4>${day}</h4>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
        <p>${Math.round(item.main.temp)}°C</p>
        <p>${item.weather[0].description}</p>
      `;
      forecastContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error al obtener pronóstico:", error);
  }
}

searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) getWeather(city);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// Inicial
setFavicon(false);
getWeather("Buenos Aires");
