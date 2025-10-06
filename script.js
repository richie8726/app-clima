const searchInput = document.getElementById("search");
const locationEl = document.getElementById("location");
const descriptionEl = document.getElementById("description");
const temperatureEl = document.getElementById("temperature");
const forecastContainer = document.getElementById("forecast-container");
const backgroundEl = document.getElementById("background");

async function getWeather(city) {
  try {
    const res = await fetch(`/.netlify/functions/weather?city=${city}`);
    const data = await res.json();

    if (data.cod !== 200) throw new Error("Ciudad no encontrada");

    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const main = data.weather[0].main.toLowerCase();

    locationEl.textContent = data.name;
    descriptionEl.textContent = desc;
    temperatureEl.textContent = `${temp}°C`;

    changeBackground(main);
    getForecast(city);
  } catch (err) {
    locationEl.textContent = "Error";
    descriptionEl.textContent = "No se pudo obtener el clima";
    temperatureEl.textContent = "--°C";
    console.error(err);
  }
}

async function getForecast(city) {
  try {
    const res = await fetch(`/.netlify/functions/forecast?city=${city}`);
    const data = await res.json();
    forecastContainer.innerHTML = "";

    const days = data.list.filter((_, i) => i % 8 === 0);
    days.forEach(day => {
      const date = new Date(day.dt_txt);
      const temp = Math.round(day.main.temp);
      const icon = day.weather[0].icon;

      const div = document.createElement("div");
      div.classList.add("forecast-day");
      div.innerHTML = `
        <p>${date.toLocaleDateString("es-ES", { weekday: "short" })}</p>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
        <p>${temp}°C</p>
      `;
      forecastContainer.appendChild(div);
    });
  } catch (err) {
    console.error("Error al obtener pronóstico", err);
  }
}

function changeBackground(condition) {
  let gradient;

  if (condition.includes("clear")) {
    gradient = "linear-gradient(180deg, #f9d423, #ff4e50)";
  } else if (condition.includes("cloud")) {
    gradient = "linear-gradient(180deg, #757f9a, #d7dde8)";
  } else if (condition.includes("rain")) {
    gradient = "linear-gradient(180deg, #3a6186, #89253e)";
  } else if (condition.includes("snow")) {
    gradient = "linear-gradient(180deg, #e6dada, #274046)";
  } else {
    gradient = "linear-gradient(180deg, #1e3c72, #2a5298)";
  }

  backgroundEl.style.background = gradient;
}

searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    getWeather(searchInput.value.trim());
  }
});

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      getWeather(`${latitude},${longitude}`);
    });
  }
});
