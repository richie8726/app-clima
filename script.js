const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

async function getWeather(city) {
  try {
    const res = await fetch(`/api/weather?city=${city}`);
    const data = await res.json();

    if (data.error) {
      alert("Error: " + data.error);
      return;
    }

    showCurrentWeather(data.current);
    showForecast(data.forecast);
    setBackgroundSVG(data.current);
  } catch (err) {
    console.error(err);
  }
}

function showCurrentWeather(current) {
  document.getElementById("cityName").textContent = current.name;
  document.getElementById("temperature").textContent = `${Math.round(current.main.temp)}°C`;
  document.getElementById("description").textContent = current.weather[0].description;
  document.getElementById("icon").innerHTML = `<img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png">`;
}

function showForecast(forecast) {
  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = "";
  const daily = {};

  forecast.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = item;
  });

  Object.values(daily).forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div>${item.dt_txt.split(" ")[0]}</div>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
      <div>${Math.round(item.main.temp)}°C</div>
    `;
    forecastEl.appendChild(div);
  });
}

function setBackgroundSVG(current) {
  const bg = document.getElementById("background-svg");
  const weatherMain = current.weather[0].main.toLowerCase();
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20;

  let svg = "";

  if (weatherMain.includes("rain")) {
    svg = `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="${isDay ? '#6ea9f7' : '#0c2d6b'}"/><circle cx="20" cy="20" r="5" fill="white"><animate attributeName="cy" values="20;80" dur="1s" repeatCount="indefinite"/></circle></svg>`;
  } else if (weatherMain.includes("cloud")) {
    svg = `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="${isDay ? '#a0c4ff' : '#1c3d5a'}"/><circle cx="50" cy="30" r="20" fill="white"/></svg>`;
  } else {
    svg = `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="${isDay ? '#87ceeb' : '#0a1f3b'}"/><circle cx="50" cy="50" r="20" fill="yellow"/></svg>`;
  }

  bg.innerHTML = svg;
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

// Autosearch ejemplo: Rosario
getWeather("Rosario");
