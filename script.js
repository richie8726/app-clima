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
        <path d="M42 32a18 18 0 1 1-16-18 14 14 0 1 0 16 18z" fill="#C0C0C0"/>
      </svg>
    `);
  } else {
    favicon.href = "data:image/svg+xml," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="14" fill="#FFD93B"/>
        <g stroke="#FFD93B" stroke-width="3">
          <line x1="32" y1="4" x2="32" y2="14"/>
          <line x1="32" y1="50" x2="32" y2="60"/>
          <line x1="4" y1="32" x2="14" y2="32"/>
          <line x1="50" y1="32" x2="60" y2="32"/>
        </g>
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

async function getWeather(city) {
  try {
    const response = await fetch(`/.netlify/functions/weather?city=${city}`);
    if (!response.ok) throw new Error("Error al obtener clima");
    const data = await response.json();

    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    details.textContent = `🌡️ Máx: ${Math.round(data.main.temp_max)}°C | Mín: ${Math.round(data.main.temp_min)}°C 
    💧 Humedad: ${data.main.humidity}%`;

    // Pronóstico extendido
    getForecast(city);
  } catch (error) {
    cityName.textContent = "Error";
    temperature.textContent = "";
    description.textContent = "No se pudo obtener el clima.";
    details.textContent = "";
    console.error(error);
  }
}

async function getForecast(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
    const data = await response.json();

    forecastContainer.innerHTML = "";

    const daily = {};

    data.list.forEach(item => {
      const date = new Date(item.dt_txt).toLocaleDateString("es-ES", { weekday: "long" });
      if (!daily[date]) {
        daily[date] = item;
      }
    });

    Object.keys(daily).slice(0, 5).forEach(day => {
      const item = daily[day];
      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = `
        <h4>${day}</h4>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
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
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Inicial
setFavicon(false);
getWeather("Buenos Aires");
