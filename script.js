const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const details = document.getElementById("details");
const forecastContainer = document.getElementById("forecast");
const modeToggle = document.getElementById("mode-toggle");

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
    let response = await fetch(`/.netlify/functions/weather?city=${city}`);
    let data;

    if (response.ok) {
      data = await response.json();
    } else {
      response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
      data = await response.json();
    }

    if (!data || data.cod && data.cod != 200) {
      cityName.textContent = "Error";
      description.textContent = data.message || "No se pudo obtener el clima.";
      details.textContent = "";
      forecastContainer.innerHTML = "";
      return;
    }

    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    details.textContent = `🌡️ Máx: ${Math.round(data.main.temp_max)}°C | Mín: ${Math.round(data.main.temp_min)}°C 💧 Humedad: ${data.main.humidity}%`;

    await getForecast(city);
  } catch (error) {
    cityName.textContent = "Error";
    description.textContent = "No se pudo obtener el clima.";
    details.textContent = "";
    forecastContainer.innerHTML = "";
    console.error(error);
  }
}

async function getForecast(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
    const data = await response.json();

    if (!data || data.cod && data.cod !== "200" && data.cod !== 200) {
      console.error("Error en pronóstico:", data);
      return;
    }

    forecastContainer.innerHTML = "";

    // Agrupar por día (ignorando hora)
    const daily = {};

    data.list.forEach(item => {
      // Extraer fecha YYYY-MM-DD
      const dt = item.dt_txt.split(" ")[0];
      if (!daily[dt]) {
        // iniciar array de items
        daily[dt] = [];
      }
      daily[dt].push(item);
    });

    // Tomar los próximos 5 días (excluyendo hoy si quieres)
    const fechas = Object.keys(daily);
    // Si la primera fecha es hoy, puedes descartarla o mostrarla como día 1:
    // fechas.shift();

    fechas.slice(0, 5).forEach(fecha => {
      const items = daily[fecha];
      // Calcular mín y máx del día
      let minTemp = Number.POSITIVE_INFINITY;
      let maxTemp = Number.NEGATIVE_INFINITY;
      // Elegir ícono representativo: por simplicidad el del medio
      const midIndex = Math.floor(items.length / 2);
      const iconItem = items[midIndex];

      items.forEach(it => {
        if (it.main.temp_min < minTemp) minTemp = it.main.temp_min;
        if (it.main.temp_max > maxTemp) maxTemp = it.main.temp_max;
      });

      // Formatear nombre del día
      const dayName = new Date(fecha).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" });

      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = `
        <h4>${dayName}</h4>
        <img src="https://openweathermap.org/img/wn/${iconItem.weather[0].icon}.png" alt="${iconItem.weather[0].description}">
        <p>Máx: ${Math.round(maxTemp)}°C</p>
        <p>Mín: ${Math.round(minTemp)}°C</p>
        <p>${iconItem.weather[0].description}</p>
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
