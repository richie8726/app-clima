/* script.js (SkyCast) - usa proxy Netlify /.netlify/functions/weather
   Si el proxy falla y existiera config.js (API_KEY), hace fallback directo.
*/

const LANG_KEY = "skycast_lang";
const THEME_KEY = "skycast_theme";
const RECENT_KEY = "skycast_recent_v2";
const ALERTS_SEEN = "skycast_alerts_seen";

const apiProxyBase = "/.netlify/functions/weather";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const geoBtn = document.getElementById("geo-btn");
const recentContainer = document.getElementById("recentContainer");
const weatherInfo = document.getElementById("weather-info");
const forecastSection = document.getElementById("forecast");
const forecastGrid = document.getElementById("forecastGrid");
const locEl = document.getElementById("loc");
const descEl = document.getElementById("desc");
const tempEl = document.getElementById("temp");
const extraEl = document.getElementById("extra");
const weatherAnim = document.getElementById("weatherAnim");
const alertBox = document.getElementById("alertBox");
const langSelect = document.getElementById("lang-select");
const themeToggle = document.getElementById("theme-toggle");

let recentSearches = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
let seenAlerts = JSON.parse(localStorage.getItem(ALERTS_SEEN) || "[]");
let currentLang = localStorage.getItem(LANG_KEY) || (navigator.language.startsWith("es") ? "es" : "en");
langSelect.value = currentLang;

// helpers
const showStatus = (txt) => { const s = document.getElementById("statusNote"); if (s) s.textContent = txt; };
const showError = (msg) => {
  alertBox.className = "alertbox error";
  alertBox.innerHTML = `<div><strong>${currentLang==="es" ? "Error" : "Error"}</strong><div style="margin-top:6px">${msg}</div></div><div><button class="close">${currentLang==="es" ? "Cerrar" : "Close"}</button></div>`;
  alertBox.classList.remove("hidden");
  alertBox.querySelector(".close").addEventListener("click", ()=> alertBox.classList.add("hidden"));
};

function limpiarUI(){
  weatherInfo.classList.add("hidden");
  forecastSection.classList.add("hidden");
  alertBox.classList.add("hidden");
  weatherAnim.innerHTML = "";
}

function renderCurrentFromData(current){
  if(!current) return;
  weatherInfo.classList.remove("hidden");
  locEl.textContent = `${current.name}, ${current.sys.country}`;
  descEl.textContent = current.weather[0].description;
  tempEl.textContent = `${Math.round(current.main.temp)}°C`;
  extraEl.textContent = `💧 ${current.main.humidity}% · 💨 ${current.wind.speed} m/s`;
  setWeatherAnimation(current.weather[0].icon, current.weather[0].id);
}

function renderForecastFromData(forecast){
  if(!forecast || !forecast.list) return;
  const days = {};
  forecast.list.forEach(item=>{
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

// animations (same as antes)
function setWeatherAnimation(iconCode, weatherId){
  weatherAnim.innerHTML = "";
  document.body.classList.remove("rain","snow");
  if(!iconCode) return;
  if(iconCode.startsWith("01")){
    const sun = document.createElement("div"); sun.className = "anim-sun"; weatherAnim.appendChild(sun);
  } else if (iconCode.startsWith("02") || iconCode.startsWith("03") || iconCode.startsWith("04")){
    const cloud = document.createElement("div"); cloud.className = "anim-cloud"; weatherAnim.appendChild(cloud);
  } else if (iconCode.startsWith("09") || iconCode.startsWith("10")){
    const cloud = document.createElement("div"); cloud.className = "anim-cloud"; weatherAnim.appendChild(cloud);
    const drops = document.createElement("div"); drops.className = "rain-drops";
    for(let i=0;i<5;i++){ const s = document.createElement("span"); drops.appendChild(s); }
    weatherAnim.appendChild(drops); document.body.classList.add("rain");
  } else if (iconCode.startsWith("11")){
    const cloud = document.createElement("div"); cloud.className = "anim-cloud"; weatherAnim.appendChild(cloud);
    const drops = document.createElement("div"); drops.className = "rain-drops";
    for(let i=0;i<6;i++){ const s = document.createElement("span"); drops.appendChild(s); }
    weatherAnim.appendChild(drops); document.body.classList.add("rain");
  } else if (iconCode.startsWith("13")){
    const snow = document.createElement("div"); snow.className = "anim-cloud"; weatherAnim.appendChild(snow);
    const flakes = document.createElement("div"); flakes.className = "snow-flakes";
    for(let i=0;i<6;i++){ const f = document.createElement("span"); flakes.appendChild(f); }
    weatherAnim.appendChild(flakes); document.body.classList.add("snow");
  } else {
    const cloud = document.createElement("div"); cloud.className = "anim-cloud"; weatherAnim.appendChild(cloud);
  }
}

// ALERTS
function showAlert(alertObj, id){
  alertBox.className = "alertbox";
  alertBox.innerHTML = `
    <div>
      <strong>${alertObj.event || (currentLang==="es" ? "Alerta" : "Alert")}</strong>
      <div style="margin-top:6px; font-size:0.95rem;">${alertObj.description ? alertObj.description.slice(0,220)+(alertObj.description.length>220?"…":"") : ""}</div>
    </div>
    <div style="display:flex; gap:8px; align-items:center;">
      <a href="#" target="_blank" rel="noopener" style="text-decoration:none; font-weight:700; color:#0a66c2;">${currentLang==="es" ? "Ver detalle" : "View details"}</a>
      <button class="close">${currentLang==="es" ? "Descartar" : "Dismiss"}</button>
    </div>
  `;
  alertBox.classList.remove("hidden");
  alertBox.querySelector(".close").addEventListener("click", ()=>{
    seenAlerts.push(id);
    localStorage.setItem(ALERTS_SEEN, JSON.stringify(seenAlerts));
    alertBox.classList.add("hidden");
  });
}

// FETCH via proxy (preferred). Fallback: direct calls if config.js exists (development).
async function fetchViaProxyOrFallback({ q, lat, lon, lang=currentLang } = {}) {
  // try proxy
  try {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (lat) params.set("lat", lat);
    if (lon) params.set("lon", lon);
    params.set("lang", lang);
    const resp = await fetch(`${apiProxyBase}?${params.toString()}`);
    if (resp.ok) {
      return await resp.json(); // { current, forecast, onecall }
    } else {
      throw new Error("proxy failed");
    }
  } catch (err) {
    // fallback: if config.js exists and defines API_KEY, call OpenWeather directly
    if (typeof API_KEY !== "undefined" && API_KEY) {
      try {
        if (q) {
          const cur = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=metric&lang=${lang}`).then(r=>r.json());
          const forr = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=metric&lang=${lang}`).then(r=>r.json());
          const oc = cur && cur.coord ? await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cur.coord.lat}&lon=${cur.coord.lon}&appid=${API_KEY}&units=metric&lang=${lang}&exclude=minutely,hourly`).then(r=>r.json()) : null;
          return { current: cur, forecast: forr, onecall: oc };
        } else if (lat && lon) {
          const cur = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`).then(r=>r.json());
          const forr = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`).then(r=>r.json());
          const oc = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}&exclude=minutely,hourly`).then(r=>r.json());
          return { current: cur, forecast: forr, onecall: oc };
        }
      } catch(e2) { throw e2; }
    }
    throw err;
  }
}

// MAIN search flow
async function buscarClima(city){
  city = (city || cityInput.value || "").trim();
  if(!city) return;
  showStatus(currentLang==="es" ? "Buscando..." : "Searching...");
  limpiarUI();
  try{
    const data = await fetchViaProxyOrFallback({ q: city, lang: currentLang });
    if (data.current) renderCurrentFromData(data.current);
    if (data.forecast) renderForecastFromData(data.forecast);
    if (data.onecall && Array.isArray(data.onecall.alerts) && data.onecall.alerts.length>0) {
      for(const al of data.onecall.alerts){
        const id = (al.event || al.sender_name || al.start) + "-" + String(al.start||"");
        if (!seenAlerts.includes(id)) { showAlert(al, id); break; }
      }
    }
    pushRecent(data.current ? data.current.name : city);
    showStatus("");
  }catch(err){
    console.error(err);
    showError(err.message || (currentLang==="es" ? "Error al obtener datos" : "Error fetching data"));
  }
}

// GEO flows (manual & auto)
async function tryGeoManual(){
  if(!navigator.geolocation){ showError(currentLang==="es" ? "Geolocalización no soportada" : "Geolocation not supported"); return; }
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      const data = await fetchViaProxyOrFallback({ lat, lon, lang: currentLang });
      if (data.current) renderCurrentFromData(data.current);
      if (data.forecast) renderForecastFromData(data.forecast);
      if (data.onecall && Array.isArray(data.onecall.alerts) && data.onecall.alerts.length>0) {
        for(const al of data.onecall.alerts){
          const id = (al.event || al.sender_name || al.start) + "-" + String(al.start||"");
          if (!seenAlerts.includes(id)) { showAlert(al, id); break; }
        }
      }
    }catch(e){ showError(e.message || "Error ubicación"); }
  }, err=> showError(currentLang==="es" ? "Permiso de ubicación denegado" : "Location permission denied"));
}

async function tryAutoGeo(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(async pos=>{
      try{
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        const data = await fetchViaProxyOrFallback({ lat, lon, lang: currentLang });
        if (data.current) renderCurrentFromData(data.current);
        if (data.forecast) renderForecastFromData(data.forecast);
        if (data.onecall && Array.isArray(data.onecall.alerts) && data.onecall.alerts.length>0) {
          for(const al of data.onecall.alerts){
            const id = (al.event || al.sender_name || al.start) + "-" + String(al.start||"");
            if (!seenAlerts.includes(id)) { showAlert(al, id); break; }
          }
        }
      }catch(e){ /* silent */ }
    }, ()=>{/*ignore*/}, {timeout:5000});
  }
}

// recents
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
    b.addEventListener("click", ()=> { cityInput.value = city; buscarClima(city); });
    recentContainer.appendChild(b);
  });
}

// UI init + events
searchBtn.addEventListener("click", ()=> buscarClima());
cityInput.addEventListener("keyup", (e)=> { if(e.key==="Enter") buscarClima(); });
geoBtn.addEventListener("click", tryGeoManual);
langSelect.addEventListener("change", ()=>{
  currentLang = langSelect.value;
  localStorage.setItem(LANG_KEY, currentLang);
});
themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
});

function init(){
  if(localStorage.getItem(THEME_KEY) === "dark") document.body.classList.add("dark");
  renderRecents();
  tryAutoGeo();
}
init();

// small safety: if both proxy and fallback missing, show message
