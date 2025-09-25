/* =========================
   SkyCast - script.js
   - animaciones por clima
   - alertas meteorológicas (One Call)
   - usa API_KEY desde config.js (NO subir)
   ========================= */

const apiKey = (typeof API_KEY !== "undefined") ? API_KEY : "";
const apiUrl = "https://api.openweathermap.org/data/2.5/";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const geoBtn = document.getElementById("geo-btn");
const recentContainer = document.getElementById("recentContainer");
const weatherInfo = document.getElementById("weather-info");
const forecastGrid = document.getElementById("forecastGrid");
const forecastSection = document.getElementById("forecast");
const locEl = document.getElementById("loc");
const descEl = document.getElementById("desc");
const tempEl = document.getElementById("temp");
const extraEl = document.getElementById("extra");
const weatherAnim = document.getElementById("weatherAnim");
const alertBox = document.getElementById("alertBox");
const langSelect = document.getElementById("lang-select");
const themeToggle = document.getElementById("theme-toggle");

// storage keys
const RECENT_KEY = "skycast_recent_v2";
const ALERTS_SEEN = "skycast_alerts_seen";
const LANG_KEY = "skycast_lang";
const THEME_KEY = "skycast_theme";

let recentSearches = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
let seenAlerts = JSON.parse(localStorage.getItem(ALERTS_SEEN) || "[]");
let currentLang = localStorage.getItem(LANG_KEY) || (navigator.language.startsWith("es") ? "es" : "en");
langSelect.value = currentLang;

// translations minimal (you can extend)
const text = {
  es: { searching: "Buscando...", error: "Error", alertLabel: "Alerta meteorológica", viewMore: "Ver detalle", dismiss: "Descartar" },
  en: { searching: "Searching...", error: "Error", alertLabel: "Weather alert", viewMore: "View details", dismiss: "Dismiss" }
};

// init
document.addEventListener("DOMContentLoaded", () => {
  renderRecents();
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") document.body.classList.add("dark");
  // try geolocate on load for immediate local weather
  tryAutoGeo();
});

// events
searchBtn.addEventListener("click", () => buscarClima());
cityInput.addEventListener("keyup", (e)=> { if(e.key === "Enter") buscarClima(); });
geoBtn.addEventListener("click", tryGeoManual);
langSelect.addEventListener("change", () => {
  currentLang = langSelect.value;
  localStorage.setItem(LANG_KEY, currentLang);
});
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
});

// ----- FUNCIONES -----
function setTextLang(key){ return text[currentLang][key] || key; }

async function buscarClima(city){
  city = (city || cityInput.value || "").trim();
  if(!city) return;
  showStatus(setTextLang("searching"));
  limpiarUI();

  try{
    const cur = await fetchCurrent(city);
    renderCurrent(cur);
    await fetchAndRenderForecast(city);
    pushRecent(cur.name);
    // get onecall alerts (needs lat + lon)
    await fetchOneCallAndAlerts(cur.coord.lat, cur.coord.lon);
    showStatus("");
  }catch(err){
    showError(err.message || setTextLang("error"));
  }
}

async function fetchCurrent(city){
  const res = await fetch(`${apiUrl}weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${currentLang}`);
  if(!res.ok) throw new Error("Ciudad no encontrada");
  return res.json();
}

async function fetchAndRenderForecast(city){
  const res = await fetch(`${apiUrl}forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${currentLang}`);
  if(!res.ok) throw new Error("Pronóstico no disponible");
  const data = await res.json();
  renderForecast(data);
}

function renderCurrent(data){
  if(!data) return;
  weatherInfo.classList.remove("hidden");
  locEl.textContent = `${data.name}, ${data.sys.country}`;
  descEl.textContent = data.weather[0].description;
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  extraEl.textContent = `💧 ${data.main.humidity}% · 💨 ${data.wind.speed} m/s`;

  // set anim
  setWeatherAnimation(data.weather[0].icon, data.weather[0].id);
}

function renderForecast(data){
  const days = {};
  data.list.forEach(item=>{
    const d = item.dt_txt.split(" ")[0];
    if(!days[d] && item.dt_txt.includes("12:00:00")) days[d] = item;
    if(!days[d] && !Object.prototype.hasOwnProperty.call(days,d)) days[d] = item;
  });
  const keys = Object.keys(days).slice(0,5);
  forecastGrid.innerHTML = "";
  keys.forEach(k=>{
    const it = days[k];
    const day = new Date(it.dt_txt).toLocaleDateString(currentLang, { weekday:'short', day:'numeric' });
    const node = document.createElement("div");
    node.className = "forecast-item";
    node.innerHTML = `<div>${day}</div><div>${Math.round(it.main.temp)}°C</div><div>${it.weather[0].description}</div>`;
    forecastGrid.appendChild(node);
  });
  forecastSection.classList.remove("hidden");
}

function setWeatherAnimation(iconCode, weatherId){
  // limpiar
  weatherAnim.innerHTML = "";
  document.body.classList.remove("rain","snow");
  // iconCode like "10d", "01n" etc
  if(iconCode.startsWith("01")){ // clear
    const sun = document.createElement("div"); sun.className = "anim-sun"; weatherAnim.appendChild(sun);
  } else if (iconCode.startsWith("02") || iconCode.startsWith("03") || iconCode.startsWith("04")){
    const cloud = document.createElement("div"); cloud.className = "anim-cloud"; weatherAnim.appendChild(cloud);
  } else if (iconCode.startsWith("09") || iconCode.startsWith("10")){
    const cloud = document.createElement("div"); cloud.className = "anim-cloud"; weatherAnim.appendChild(cloud);
    const drops = document.createElement("div"); drops.className = "rain-drops";
    for(let i=0;i<5;i++){ const s = document.createElement("span"); drops.appendChild(s); }
    weatherAnim.appendChild(drops);
    document.body.classList.add("rain");
  } else if (iconCode.startsWith("11")){
    const cloud = document.createElement("div"); cloud.className = "anim-cloud"; weatherAnim.appendChild(cloud);
    const drops = document.createElement("div"); drops.className = "rain-drops";
    for(let i=0;i<6;i++){ const s = document.createElement("span"); drops.appendChild(s); }
    weatherAnim.appendChild(drops);
    document.body.classList.add("rain");
  } else if (iconCode.startsWith("13")){
    const snow = document.createElement("div"); snow.className = "anim-cloud"; weatherAnim.appendChild(snow);
    const flakes = document.createElement("div"); flakes.className = "snow-flakes";
    for(let i=0;i<6;i++){ const f = document.createElement("span"); flakes.appendChild(f); }
    weatherAnim.appendChild(flakes);
    document.body.classList.add("snow");
  } else if (iconCode.startsWith("50")){
    const cloud = document.createElement("div"); cloud.className = "anim-cloud"; weatherAnim.appendChild(cloud);
    // subtle fog effect could be CSS (we use cloud)
  } else {
    const cloud = document.createElement("div"); cloud.className = "anim-cloud"; weatherAnim.appendChild(cloud);
  }
}

// ----- ALERTAS (One Call) -----
async function fetchOneCallAndAlerts(lat, lon){
  try{
    // One Call API (v2.5) endpoint for alerts (if available)
    const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${currentLang}&exclude=minutely,hourly`);
    if(!res.ok) return; // no halt if not available
    const data = await res.json();
    if(data.alerts && Array.isArray(data.alerts) && data.alerts.length>0){
      // show the first un-seen alert
      for(const al of data.alerts){
        const id = (al.event || al.sender_name || al.start) + "-" + String(al.start||"");
        if(!seenAlerts.includes(id)){
          showAlert(al, id);
          break;
        }
      }
    }
  }catch(e){
    console.warn("OneCall/alerts error:", e);
  }
}

function showAlert(alertObj, id){
  alertBox.className = "alertbox";
  alertBox.innerHTML = `
    <div>
      <strong>${alertObj.event || (currentLang==="es" ? "Alerta" : "Alert")}</strong>
      <div style="margin-top:6px; font-size:0.95rem;">${alertObj.description ? alertObj.description.slice(0,220) + (alertObj.description.length>220?"…":"") : ""}</div>
    </div>
    <div style="display:flex; gap:8px; align-items:center;">
      <a href="${alertObj.sender_name ? '#' : '#'}" target="_blank" rel="noopener" class="viewmore" style="text-decoration:none; font-weight:700; color:#0a66c2;">${currentLang==="es" ? "Ver detalle" : "View details"}</a>
      <button class="close">${currentLang==="es" ? "Descartar" : "Dismiss"}</button>
    </div>
  `;
  alertBox.classList.remove("hidden");

  // when dismissed: mark alert as seen
  alertBox.querySelector(".close").addEventListener("click", ()=>{
    seenAlerts.push(id);
    localStorage.setItem(ALERTS_SEEN, JSON.stringify(seenAlerts));
    alertBox.classList.add("hidden");
  });
}

// ----- GEO / recents / helpers -----
async function tryGeoManual(){
  if(!navigator.geolocation){ alert("Geolocalización no soportada"); return; }
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      const res = await fetch(`${apiUrl}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${currentLang}`);
      if(!res.ok) throw new Error("No se pudo obtener datos por ubicación");
      const data = await res.json();
      renderCurrent(data);
      await fetchAndRenderForecastCoords(lat, lon);
      await fetchOneCallAndAlerts(lat, lon);
    }catch(e){ showError(e.message); }
  }, err=> showError("Permiso de ubicación denegado"));
}

async function tryAutoGeo(){
  // optionally, attempt geolocation once (no insist)
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(async pos=>{
      try{
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        const res = await fetch(`${apiUrl}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${currentLang}`);
        if(!res.ok) return;
        const data = await res.json();
        renderCurrent(data);
        await fetchAndRenderForecastCoords(lat, lon);
        await fetchOneCallAndAlerts(lat, lon);
      }catch(e){ /* ignore silently */ }
    }, ()=>{/* user denied or unavailable */}, {timeout:5000});
  }
}

async function fetchAndRenderForecastCoords(lat, lon){
  const url = `${apiUrl}forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${currentLang}`;
  try{
    const res = await fetch(url);
    if(!res.ok) return;
    const data = await res.json();
    renderForecast(data);
  }catch(e){ console.warn(e); }
}

function pushRecent(city){
  city = city.trim();
  if(!city) return;
  recentSearches = recentSearches.filter(c=> c.toLowerCase() !== city.toLowerCase());
  recentSearches.unshift(city);
  if(recentSearches.length>8) recentSearches.pop();
  localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches));
  renderRecents();
}
function renderRecents(){
  recentContainer.innerHTML = "";
  recentSearches.forEach(city=>{
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = city;
    b.addEventListener("click", ()=> {
      cityInput.value = city;
      buscarClima(city);
    });
    recentContainer.appendChild(b);
  });
}

function limpiarUI(){
  weatherInfo.classList.add("hidden");
  forecastSection.classList.add("hidden");
  alertBox.classList.add("hidden");
  weatherAnim.innerHTML = "";
}

function showError(msg){
  alertBox.className = "alertbox error";
  alertBox.innerHTML = `<div><strong>${currentLang==="es" ? "Error" : "Error"}</strong><div style="margin-top:6px">${msg}</div></div><div><button class="close">${currentLang==="es" ? "Cerrar" : "Close"}</button></div>`;
  alertBox.classList.remove("hidden");
  alertBox.querySelector(".close").addEventListener("click", ()=> alertBox.classList.add("hidden"));
}

function showStatus(txt){
  const status = document.getElementById("statusNote");
  if(status) status.textContent = txt;
}

// small safety: if API key missing
if(!apiKey){
  showError("No API key. Create config.js with your key (and don't push it).");
}
