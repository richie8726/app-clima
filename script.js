// =====================
// SkyCast - script.js
// =====================

// API Key (se obtiene de config.js)
const apiKey = (typeof API_KEY !== "undefined") ? API_KEY : "";

/* DOM */
const ciudadInput = document.getElementById("ciudadInput");
const btnBuscar = document.getElementById("btnBuscar");
const btnGeo = document.getElementById("btnGeo");
const modoAuto = document.getElementById("modoAuto");
const recentContainer = document.getElementById("recentContainer");
const currentCard = document.getElementById("currentCard");
const forecastGrid = document.getElementById("forecastGrid");
const statusNote = document.getElementById("statusNote");

/* Estado */
let recentSearches = JSON.parse(localStorage.getItem("skycast_recent") || "[]");

/* Inits */
document.addEventListener("DOMContentLoaded", () => {
  renderRecents();
  autoModeByHour();
});

/* Listeners */
btnBuscar?.addEventListener("click", () => buscarClima());
ciudadInput?.addEventListener("keyup", (e) => { if (e.key === "Enter") buscarClima(); });
btnGeo?.addEventListener("click", buscarPorUbicacion);
modoAuto?.addEventListener("click", toggleManualMode);

/* UTIL: escape */
function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

/* BUSCAR por input */
async function buscarClima(ciudad){
  ciudad = (ciudad || ciudadInput.value || "").trim();
  if(!ciudad){ statusNote.textContent = "Escribí una ciudad"; return; }
  statusNote.textContent = "Buscando...";
  limpiar();
  try {
    const [current, forecast] = await Promise.all([
      fetchCurrent(ciudad),
      fetchForecast(ciudad)
    ]);
    renderCurrent(current);
    renderForecast(forecast);
    pushRecent(current.name);
    statusNote.textContent = "";
  } catch(err){
    statusNote.textContent = err.message || "Error al obtener datos";
  }
}

/* FETCH helpers */
async function fetchCurrent(city){
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
  const res = await fetch(url);
  if(!res.ok) throw new Error("Ciudad no encontrada");
  return res.json();
}
async function fetchForecast(city){
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
  const res = await fetch(url);
  if(!res.ok) throw new Error("Pronóstico no disponible");
  return res.json();
}

/* RENDER current */
function renderCurrent(data){
  if(!data) return;
  setBodyClassByWeather(data.weather[0]);
  const icon = mapIcon(data.weather[0]);
  const html = `
    <div class="card card-current show">
      <div class="left">
        <i class="wi ${icon}"></i>
        <div>
          <h2>${esc(data.name)}, ${esc(data.sys.country)}</h2>
          <p>${esc(data.weather[0].description)}</p>
          <p><strong>${Math.round(data.main.temp)}°C</strong></p>
        </div>
      </div>
      <div class="right">
        <p>💧 Humedad: ${data.main.humidity}%</p>
        <p>💨 Viento: ${data.wind.speed} m/s</p>
      </div>
    </div>`;
  currentCard.innerHTML = html;
  currentCard.classList.remove("hidden");
  currentCard.classList.add("show");
}

/* RENDER forecast */
function renderForecast(forecast){
  if(!forecast || !forecast.list) return;
  const days = {};
  for(const item of forecast.list){
    const day = item.dt_txt.split(' ')[0];
    if(!days[day] && item.dt_txt.includes("12:00:00")) days[day] = item;
    if(!days[day] && !Object.prototype.hasOwnProperty.call(days, day)) days[day] = item;
  }
  const keys = Object.keys(days).slice(0,5);
  forecastGrid.innerHTML = "";
  keys.forEach(k => {
    const it = days[k];
    const date = new Date(it.dt_txt);
    const weekday = date.toLocaleDateString(undefined,{ weekday:'short', day:'numeric' });
    const icon = mapIcon(it.weather[0]);
    const node = document.createElement("div");
    node.className = "forecast-item";
    node.innerHTML = `
      <div class="date">${esc(weekday)}</div>
      <i class="wi ${icon}"></i>
      <div class="desc">${esc(it.weather[0].description)}</div>
      <div class="temp"><strong>${Math.round(it.main.temp)}°C</strong></div>
    `;
    forecastGrid.appendChild(node);
  });
  forecastGrid.classList.remove("hidden");
  forecastGrid.classList.add("show");
}

/* GEO */
function buscarPorUbicacion(){
  if(!navigator.geolocation){ statusNote.textContent = "Geolocalización no soportada"; return; }
  statusNote.textContent = "Buscando ubicación...";
  navigator.geolocation.getCurrentPosition(async pos=>{
    try {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`);
      if(!curRes.ok) throw new Error("No fue posible obtener ubicación");
      const cur = await curRes.json();
      renderCurrent(cur);
      pushRecent(cur.name);
      const forRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`);
      if(forRes.ok){ const fo = await forRes.json(); renderForecast(fo); }
      statusNote.textContent = "";
    } catch(err){ statusNote.textContent = err.message || "Error ubicación"; }
  }, err=> { statusNote.textContent = "Permiso de ubicación denegado"; });
}

/* RECENTS */
function renderRecents(){
  recentContainer.innerHTML = "";
  recentSearches.forEach(city=>{
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = city;
    b.addEventListener("click", ()=> buscarClima(city));
    recentContainer.appendChild(b);
  });
}
function pushRecent(city){
  city = city.trim();
  if(!city) return;
  recentSearches = recentSearches.filter(c=> c.toLowerCase() !== city.toLowerCase());
  recentSearches.unshift(city);
  if(recentSearches.length > 6) recentSearches.pop();
  localStorage.setItem("skycast_recent", JSON.stringify(recentSearches));
  renderRecents();
}

/* MAP weather -> body class & icon mapping */
function setBodyClassByWeather(w){
  const main = (w.main || w) .toString().toLowerCase();
  const id = w.id || 0;
  let cls = "clear";
  if(main.includes("cloud") || id >= 801) cls = "clouds";
  if(main.includes("rain") || main.includes("drizzle") || id>=500 && id<600) cls = "rain";
  if(main.includes("thunder") || id>=200 && id<300) cls = "storm";
  if(main.includes("snow") || id>=600 && id<700) cls = "snow";
  if(main.includes("mist") || main.includes("fog") || id>=700 && id<800) cls = "mist";
  document.body.classList.remove("clear","clouds","rain","storm","snow","mist");
  document.body.classList.add(cls);
}

function mapIcon(w){
  const main = (w.main || w).toString().toLowerCase();
  const id = w.id || 0;
  if(main.includes("clear")) return "wi-day-sunny";
  if(main.includes("cloud")) return "wi-cloud";
  if(main.includes("rain")) return "wi-rain";
  if(main.includes("drizzle")) return "wi-sprinkle";
  if(main.includes("thunder")) return "wi-thunderstorm";
  if(main.includes("snow")) return "wi-snow";
  if(main.includes("mist") || main.includes("fog")) return "wi-fog";
  return "wi-day-cloudy";
}

/* Limpiar */
function limpiar(){
  currentCard.innerHTML = ""; currentCard.classList.add("hidden");
  forecastGrid.innerHTML = ""; forecastGrid.classList.add("hidden");
}

/* Auto / manual theme */
function toggleManualMode(){
  document.body.classList.toggle("night");
  if (document.body.classList.contains("night")) {
    localStorage.setItem("skycast_theme", "night");
  } else {
    localStorage.setItem("skycast_theme", "day");
  }
}

function autoModeByHour(){
  const saved = localStorage.getItem("skycast_theme");
  if (saved) {
    if (saved === "night") document.body.classList.add("night");
    return;
  }
  const h = new Date().getHours();
  if(h >= 19 || h <= 6){ document.body.classList.add("night"); }
}
