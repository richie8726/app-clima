const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const details = document.getElementById("details");
const forecastContainer = document.getElementById("forecast");
const modeToggle = document.getElementById("mode-toggle");
const favicon = document.querySelector("link[rel='icon']");

let nightMode = false;

// --- Función para favicon ---
function setFavicon(night = false) {
  favicon.href = night ? "assets/moon.svg" : "assets/sun.svg";
}

// --- Modo día/noche manual ---
modeToggle.addEventListener("click", () => {
  nightMode = !nightMode;
  document.body.classList.toggle("night-mode", nightMode);
  document.body.classList.toggle("day-mode", !nightMode);
  modeToggle.textContent = nightMode ? "☀️" : "🌙";
  setFavicon(nightMode);
});

// --- Fondo según clima ---
function setWeatherBackground(desc) {
  document.body.classList.remove("bg-sunny", "bg-cloudy", "bg-rainy", "bg-snowy");

  desc = desc.toLowerCase();
  if (desc.includes("sol") || desc.includes("claro")) document.body.classList.add("bg-sunny");
  else if (desc.includes("nube")) document.body.classList.add("bg-cloudy");
  else if (desc.includes("lluvia") || desc.includes("tormenta")) document.body.classList.add("bg-rainy");
  else if (desc.includes("nieve")) document.body.classList.add("bg-snowy");
}

// --- Geolocalización inicial ---
async function initWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      await getWeatherByCoords(lat, lon);
    }, () => {
      cityName.textContent = "Busca tu ciudad...";
    });
  } else {
    cityName.textContent = "Busca tu ciudad...";
  }
}

// --- Obtener clima por ciudad ---
async function getWeather(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
    const data = await res.json();
    if (!data || data.cod && data.cod != 200) throw new Error(data.message || "Error API");

    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    details.textContent = `🌡️ Máx: ${Math.round(data.main.temp_max)}°C | Mín: ${Math.round(data.main.temp_min)}°C 💧 Humedad: ${data.main.humidity}%`;

    setWeatherBackground(data.weather[0].description);
    await getForecast(city);
  } catch(e) {
    cityName.textContent = "Error";
    description.textContent = e.message;
    details.textContent = "";
    forecastContainer.innerHTML = "";
  }
}

// --- Obtener clima por coordenadas ---
async function getWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`);
    const data = await res.json();
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    details.textContent = `🌡️ Máx: ${Math.round(data.main.temp_max)}°C | Mín: ${Math.round(data.main.temp_min)}°C 💧 Humedad: ${data.main.humidity}%`;
    setWeatherBackground(data.weather[0].description);
    await getForecast(data.name);
  } catch(e) {
    cityName.textContent = "Error";
    description.textContent = e.message;
    details.textContent = "";
    forecastContainer.innerHTML = "";
  }
}

// --- Pronóstico extendido ---
async function getForecast(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
    const data = await res.json();
    if (!data || data.cod != "200") throw new Error("Error pronóstico");

    forecastContainer.innerHTML = "";

    const daily = {};
    data.list.forEach(item => {
      const dt = item.dt_txt.split(" ")[0];
      if (!daily[dt]) daily[dt] = [];
      daily[dt].push(item);
    });

    Object.keys(daily).slice(0,5).forEach(fecha => {
      const items = daily[fecha];
      let minTemp = Math.min(...items.map(it=>it.main.temp_min));
      let maxTemp = Math.max(...items.map(it=>it.main.temp_max));
      const midItem = items[Math.floor(items.length/2)];

      const dayName = new Date(fecha).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"short"});
      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = `
        <h4>${dayName}</h4>
        <img src="https://openweathermap.org/img/wn/${midItem.weather[0].icon}.png" alt="${midItem.weather[0].description}">
        <p>Máx: ${Math.round(maxTemp)}°C</p>
        <p>Mín: ${Math.round(minTemp)}°C</p>
        <p>${midItem.weather[0].description}</p>
      `;
      forecastContainer.appendChild(card);
    });

  } catch(e) { console.error(e); }
}

// --- Botón búsqueda ---
searchBtn.addEventListener("click", ()=>{ const city = searchInput.value.trim(); if(city) getWeather(city); });
searchInput.addEventListener("keypress", (e)=>{ if(e.key==="Enter") searchBtn.click(); });

// --- Inicial ---
setFavicon(false);
initWeather();
