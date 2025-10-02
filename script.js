// script.js

const API_URL = "/.netlify/functions/weather"; // Proxy en producción

// 🎯 Buscar clima
document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    buscarClima(city);
  }
});

// 🎯 Geolocalización automática
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(
          `${API_URL}?lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();

        if (data && !data.error) {
          renderWeather(data.current, data.forecast || []);
          mostrarAlertas(data.alerts || []);
        } else {
          console.warn("Error desde función Netlify (geo):", data?.error);
        }
      } catch (error) {
        console.error("Error con geolocalización:", error);
      }
    });
  }
};

// 🎯 Buscar clima con proxy o fallback local
async function buscarClima(city) {
  try {
    let response = await fetch(`${API_URL}?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error("Fallo en Netlify proxy");

    let data = await response.json();
    if (data.error) throw new Error(data.error);

    renderWeather(data.current, data.forecast || []);
    mostrarAlertas(data.alerts || []);
    guardarHistorial(city);
  } catch (error) {
    console.warn("Usando fallback con config.js...", error.message);
    if (typeof apiKey !== "undefined") {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}&lang=es`
      );
      const data = await response.json();
      renderWeather(data.list[0], data.list || []);
      mostrarAlertas([]);
      guardarHistorial(city);
    } else {
      alert("No se pudo obtener el clima. Verifica la configuración.");
    }
  }
}

// 🎯 Renderizar clima
function renderWeather(current, forecast) {
  if (!current || !current.main) {
    console.warn("Datos de clima incompletos:", current);
    return;
  }

  const weatherResult = document.getElementById("weather-result");
  weatherResult.innerHTML = `
    <h2>${current.name || "Ubicación actual"}</h2>
    <p>${current.weather[0].description}</p>
    <p>🌡️ ${Math.round(current.main.temp)}°C</p>
    <p>💧 Humedad: ${current.main.humidity}%</p>
    <p>💨 Viento: ${current.wind.speed} m/s</p>
  `;

  setWeatherAnimation(current.weather[0].icon, current.weather[0].id);
  if (forecast && forecast.length > 0) renderForecast(forecast);
}

// 🎯 Renderizar pronóstico extendido
function renderForecast(forecast) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  forecast.slice(0, 5).forEach((item) => {
    if (!item.main || !item.weather) return;
    const date = new Date(item.dt_txt);
    const day = date.toLocaleDateString("es-ES", { weekday: "short" });

    forecastContainer.innerHTML += `
      <div class="forecast-item">
        <p>${day}</p>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="icono clima">
        <p>${Math.round(item.main.temp)}°C</p>
      </div>
    `;
  });
}

// 🎯 Animaciones dinámicas
function setWeatherAnimation(iconCode, weatherId) {
  const body = document.body;
  body.classList.remove("clear", "clouds", "rain", "storm", "snow", "night");

  if (iconCode.includes("n")) {
    body.classList.add("night");
  } else if (weatherId >= 200 && weatherId < 300) {
    body.classList.add("storm");
  } else if (weatherId >= 300 && weatherId < 600) {
    body.classList.add("rain");
  } else if (weatherId >= 600 && weatherId < 700) {
    body.classList.add("snow");
  } else if (weatherId >= 800 && weatherId < 801) {
    body.classList.add("clear");
  } else if (weatherId > 800) {
    body.classList.add("clouds");
  }
}

// 🎯 Alertas meteorológicas
let seenAlerts = JSON.parse(localStorage.getItem("seenAlerts")) || [];

function mostrarAlertas(alerts) {
  const alertsContainer = document.getElementById("alerts");
  alertsContainer.innerHTML = "";

  if (!alerts || alerts.length === 0) return;

  alerts.forEach((alert) => {
    if (!seenAlerts.includes(alert.event)) {
      const div = document.createElement("div");
      div.classList.add("alert");
      div.innerHTML = `
        <h3>⚠️ ${alert.event}</h3>
        <p>${alert.description}</p>
        <small>${new Date(alert.start * 1000).toLocaleString()} - ${new Date(
        alert.end * 1000
      ).toLocaleString()}</small>
      `;
      alertsContainer.appendChild(div);
      seenAlerts.push(alert.event);
    }
  });

  localStorage.setItem("seenAlerts", JSON.stringify(seenAlerts));
}

// 🎯 Historial
function guardarHistorial(city) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("history", JSON.stringify(history));
  }
}
