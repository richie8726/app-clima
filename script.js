const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const forecastCards = document.getElementById("forecast-cards");
const weatherAnimation = document.getElementById("weather-animation");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

async function getWeather(city) {
  try {
    const res = await fetch(`/.netlify/functions/weather?city=${city}`);
    const data = await res.json();

    if (!data || !data.current) {
      cityName.textContent = "Ciudad no encontrada";
      return;
    }

    const temp = Math.round(data.current.temp);
    const desc = data.current.weather[0].description;
    const main = data.current.weather[0].main;

    cityName.textContent = city.toUpperCase();
    temperature.textContent = `${temp}°C`;
    description.textContent = desc;

    updateAnimation(main);
    updateForecast(data.daily);
    updateTheme(main);
  } catch (err) {
    console.error(err);
  }
}

function updateForecast(days) {
  forecastCards.innerHTML = "";
  days.slice(1, 6).forEach(day => {
    const card = document.createElement("div");
    card.classList.add("forecast-card");

    const date = new Date(day.dt * 1000).toLocaleDateString("es-AR", {
      weekday: "short",
    });

    const temp = Math.round(day.temp.day);
    const icon = day.weather[0].main;

    card.innerHTML = `
      <p>${date}</p>
      <p>${temp}°C</p>
      <p>${icon}</p>
    `;
    forecastCards.appendChild(card);
  });
}

function updateTheme(main) {
  const body = document.body;
  body.className = "";
  if (main.includes("Cloud")) body.classList.add("cloudy");
  else if (main.includes("Rain")) body.classList.add("rainy");
  else if (main.includes("Clear")) body.classList.add("sunny");
  else body.classList.add("night");
}

function updateAnimation(main) {
  let svg = "";

  if (main.includes("Clear")) {
    svg = `
      <svg width="120" height="120" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="12" fill="#FFD93B">
          <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    `;
  } else if (main.includes("Cloud")) {
    svg = `
      <svg width="140" height="120" viewBox="0 0 64 64">
        <ellipse cx="32" cy="36" rx="18" ry="10" fill="#B0BEC5">
          <animate attributeName="cx" values="28;36;28" dur="3s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    `;
  } else if (main.includes("Rain")) {
    svg = `
      <svg width="140" height="140" viewBox="0 0 64 64">
        <ellipse cx="32" cy="36" rx="18" ry="10" fill="#90A4AE"/>
        <line x1="28" y1="46" x2="28" y2="56" stroke="#4FC3F7" stroke-width="2">
          <animate attributeName="y1" values="46;50;46" dur="1s" repeatCount="indefinite" />
          <animate attributeName="y2" values="56;60;56" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="36" y1="46" x2="36" y2="56" stroke="#4FC3F7" stroke-width="2">
          <animate attributeName="y1" values="46;50;46" dur="1s" begin="0.3s" repeatCount="indefinite" />
          <animate attributeName="y2" values="56;60;56" dur="1s" begin="0.3s" repeatCount="indefinite" />
        </line>
      </svg>
    `;
  }

  weatherAnimation.innerHTML = svg;
}
