const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const details = document.getElementById("details");
const forecastContainer = document.getElementById("forecast");
const modeToggle = document.getElementById("mode-toggle");
const weatherAnimation = document.getElementById("weather-animation");

// Favicon dinámico
const favicon = document.querySelector("link[rel='icon']");

function setFavicon(night = false) {
  if (night) {
    favicon.href = "data:image/svg+xml," + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
        <circle cx='40' cy='24' r='14' fill='#C0C0C0'/>
      </svg>
    `);
  } else {
    favicon.href = "data:image/svg+xml," + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
        <circle cx='32' cy='32' r='14' fill='#FFD93B'/>
      </svg>
    `);
  }
}

// Modo día/noche
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

// Animación SVG según clima
function updateAnimation(weather) {
  const condition = weather.toLowerCase();
  let svg = "";

  if (condition.includes("sol") || condition.includes("clear")) {
    svg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="20" fill="#FFD93B">
          <animate attributeName="r" values="18;22;18" dur="3s" repeatCount="indefinite"/>
        </circle>
      </svg>`;
  } else if (condition.includes("nube") || condition.includes("cloud")) {
    svg = `
      <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="40" cy="35" rx="25" ry="15" fill="#ccc">
          <animateTransform attributeName="transform" type="translate" values="0;3;0" dur="2s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="65" cy="35" rx="20" ry="12" fill="#ddd">
          <animateTransform attributeName="transform" type="translate" values="0;-2;0" dur="3s" repeatCount="indefinite"/>
        </ellipse>
      </svg>`;
  } else if (condition.includes("rain") || condition.includes("lluv")) {
    svg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="40" rx="25" ry="12" fill="#999"/>
        <line x1="45" y1="50" x2="40" y2="65" stroke="#00bfff" stroke-width="3">
          <animate attributeName="y1" values="50;70" dur="0.8s" repeatCount="indefinite"/>
          <animate attributeName="y2" values="65;85" dur="0.8s" repeatCount="indefinite"/>
        </line>
        <line x1="55" y1="50" x2="60" y2="65" stroke="#00bfff" stroke-width="3">
          <animate attributeName="y1" values="50;70" dur="0.8s" repeatCount="indefinite" begin="0.2s"/>
          <animate attributeName="y2" values="65;85" dur="0.8s" repeatCount="indefinite" begin="0.2s"/>
        </line>
      </svg>`;
  } else {
    svg = "";
  }

  weatherAnimation.innerHTML = svg;
}

// Clima actual
async function getWeather(city) {
  try {
    let response = await fetch(`/.netlify/functions/weather?city=${city}`);
    let data;

    if (response.ok) {
      data = await response.json();
    } else {
      response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
      data = await response.json();
    }

    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    details.textContent = `🌡️ Máx: ${Math.round(data.main.temp_max)}°C | Mín: ${Math.round(data.main.temp_min)}°C | 💧 Humedad: ${data.main.humidity}%`;

    updateAnimation(data.weather[0].description);
    getForecast(city);
  } catch (error) {
    cityName.textContent = "Error";
    description.textContent = "No se pudo obtener el clima.";
    console.error(error);
  }
}

// Pronóstico extendido (5 días)
async function getForecast(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
    const data = await response.json();

    forecastContainer.innerHTML = "";
    const daily = {};

    data.list.forEach(item => {
      const date = new Date(item.dt_txt);
      const dayName = date.toLocaleDateString("es-ES", { weekday: "long" });
      if (!daily[dayName] && date.getHours() === 12) daily[dayName] = item;
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

// Eventos
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
