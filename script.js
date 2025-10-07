// script.js - Meteorologi
const API_PATH = "/api/weather"; // coincide con netlify.toml redirect
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const icon = document.getElementById("icon");
const forecastDiv = document.getElementById("forecast");
const bgSvg = document.getElementById("background-svg");
const appTitle = document.getElementById("app-title");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

// If user presses Enter
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

async function getWeather(city) {
  try {
    // call serverless function via /api/weather
    const res = await fetch(`${API_PATH}?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      const message = data && data.error ? data.error : `Error ${res.status}`;
      showError(message);
      return;
    }

    // data structure: { current, forecast }
    showCurrentWeather(data.current);
    showForecast(data.forecast);
  } catch (err) {
    console.error(err);
    showError("Error de red o servidor");
  }
}

function showError(msg) {
  cityName.textContent = "Error";
  temperature.textContent = "";
  description.textContent = msg;
  forecastDiv.innerHTML = "";
  bgSvg.innerHTML = "";
}

function showCurrentWeather(current) {
  if (!current || !current.main) {
    showError("Datos del clima no disponibles");
    return;
  }

  cityName.textContent = current.name || "--";
  temperature.textContent = `${Math.round(current.main.temp)}°C`;
  description.textContent = current.weather && current.weather[0] ? current.weather[0].description : "";
  icon.innerHTML = current.weather && current.weather[0] ? `<img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="">` : "";

  // decide day/night via icon 'n' suffix (OpenWeather: '10n' means night)
  const isNight = current.weather && current.weather[0] && current.weather[0].icon && current.weather[0].icon.includes("n");
  const main = current.weather && current.weather[0] ? current.weather[0].main : "Clear";

  setBackground(main, isNight);
}

function showForecast(forecast) {
  if (!forecast || !forecast.list) {
    forecastDiv.innerHTML = "";
    return;
  }

  // pick items at 12:00 or the first item per day
  const dailyMap = {};
  forecast.list.forEach(item => {
    const day = item.dt_txt.split(" ")[0];
    if (!dailyMap[day] && item.dt_txt.includes("12:00:00")) dailyMap[day] = item;
  });
  // fallback: if some days missing 12:00, take first per day
  if (Object.keys(dailyMap).length < 5) {
    const fallback = {};
    forecast.list.forEach(item => {
      const day = item.dt_txt.split(" ")[0];
      if (!fallback[day]) fallback[day] = item;
    });
    Object.assign(dailyMap, fallback);
  }

  const days = Object.values(dailyMap).slice(0, 5);
  forecastDiv.innerHTML = "";
  days.forEach(item => {
    const date = new Date(item.dt_txt).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
    const temp = Math.round(item.main.temp);
    const description = item.weather[0].description;
    const dayNode = document.createElement("div");
    dayNode.className = "day";
    dayNode.innerHTML = `<div>${date}</div><img src="${iconUrl}" alt="${description}" /><div>${temp}°C</div><div style="font-size:0.8rem;opacity:0.9">${description}</div>`;
    forecastDiv.appendChild(dayNode);
  });
}

/* Background logic:
   - prefer loading assets/*.svg (if you keep files in assets/)
   - if asset missing, use inline fallback simple SVG
*/
function setBackground(condition, isNight) {
  condition = (condition || "").toLowerCase();
  // Map conditions to asset filenames
  let asset = "assets/cloudy.svg";
  if (condition.includes("clear")) asset = isNight ? "assets/moon.svg" : "assets/sunny.svg";
  else if (condition.includes("cloud")) asset = "assets/cloudy.svg";
  else if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunder")) asset = "assets/rain.svg";
  else if (condition.includes("snow")) asset = "assets/snow.svg";
  // Try to load asset (if exists on server). We'll attempt to fetch it; if 404 -> fallback inline
  fetch(asset).then(r=>{
    if (r.ok) {
      // embed as <img> so it keeps its internal SVG animation
      bgSvg.innerHTML = `<img src="${asset}" alt="${condition}" />`;
      // also adjust body gradient color to match mood
      applyGradient(condition, isNight);
    } else {
      // fallback inline SVG generator
      bgSvg.innerHTML = inlineSVG(condition, isNight);
      applyGradient(condition, isNight);
    }
  }).catch(()=> {
    bgSvg.innerHTML = inlineSVG(condition, isNight);
    applyGradient(condition, isNight);
  });
}

function applyGradient(condition, isNight) {
  const body = document.body;
  if (isNight) {
    if (condition.includes("clear")) body.style.background = "linear-gradient(180deg,#0f2b4a,#1b415f)";
    else if (condition.includes("cloud")) body.style.background = "linear-gradient(180deg,#2a2f3a,#3b4754)";
    else if (condition.includes("rain")) body.style.background = "linear-gradient(180deg,#1b3a4b,#163246)";
    else body.style.background = "linear-gradient(180deg,#1b2a3b,#123)";
  } else {
    if (condition.includes("clear")) body.style.background = "linear-gradient(180deg,#f9d423,#ff4e50)";
    else if (condition.includes("cloud")) body.style.background = "linear-gradient(180deg,#a0c4ff,#cfe9ff)";
    else if (condition.includes("rain")) body.style.background = "linear-gradient(180deg,#6ea9f7,#2b6db1)";
    else body.style.background = "linear-gradient(180deg,#83a4d4,#b6fbff)";
  }
}

/* inlineSVG: tiny inline fallback (keeps animation) */
function inlineSVG(condition, isNight) {
  if (condition.includes("rain")) {
    return `
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect width="100" height="100" fill="${isNight ? '#0a2b45' : '#6ea9f7'}"/>
        ${[20,40,60,80].map((x,i)=>`<line x1="${x}" y1="${10 - i*10}" x2="${x}" y2="110" stroke="#bde6ff" stroke-width="1">
          <animate attributeName="y1" values="${10 - i*10};110;${10 - i*10}" dur="${0.9 + i*0.15}s" repeatCount="indefinite" />
        </line>`).join('')}
      </svg>`;
  } else if (condition.includes("cloud")) {
    return `
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect width="100" height="100" fill="${isNight ? '#1a2b3a' : '#a0c4ff'}"/>
        <ellipse cx="30" cy="45" rx="24" ry="14" fill="#fff" opacity="0.92">
          <animateTransform attributeName="transform" type="translate" values="0 0;8 0;0 0" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="65" cy="52" rx="30" ry="16" fill="#fff" opacity="0.85">
          <animateTransform attributeName="transform" type="translate" values="0 0;-8 0;0 0" dur="10s" repeatCount="indefinite" />
        </ellipse>
      </svg>`;
  } else {
    // sunny / default
    return `
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect width="100" height="100" fill="${isNight ? '#071733' : '#87ceeb'}"/>
        <circle cx="${isNight ? 80 : 50}" cy="${isNight ? 20 : 30}" r="14" fill="${isNight ? '#F4F1BB' : '#FFD93B'}">
          <animate attributeName="r" values="12;16;12" dur="3s" repeatCount="indefinite"/>
        </circle>
      </svg>`;
  }
}

/* Optional: if you want an initial city loaded, uncomment below */
 // getWeather("Buenos Aires");
