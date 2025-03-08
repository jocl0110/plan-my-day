// Variables for the Elements
const inputEl = document.getElementById("city_input");
const weatherReportEl = document.getElementById("weather_report");
const messageEl = document.getElementById("message");
const loadingEl = document.getElementById("loading");
const footerEl = document.getElementById("footer");
const formEl = document.getElementById("form");

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  // Remove whitespaces
  const city = inputEl.value.trim();
  messageEl.classList.remove("error", "warning");
  if (!city) {
    loadingEl.style.display = "none";
    weatherReportEl.style.display = "none";
    messageEl.style.display = "block";
    messageEl.classList.add("warning");
    messageEl.textContent = `Please enter a city name`;
    return;
  }

  loadingEl.style.display = "block";
  weatherReportEl.innerHTML = "";
  messageEl.textContent = "";
  weatherReportEl.style.display = "none";

  try {
    //   Get coordinates from city name
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      loadingEl.style.display = "none";
      messageEl.style.display = "block";
      messageEl.classList.add("warning");
      messageEl.textContent = `⚠️City not found.`;
      return;
    }

    const { latitude, longitude, name, country, admin1 } = geoData.results[0];
    // Get Weather Data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const weatherData = await weatherResponse.json();

    const temp = weatherData.current_weather.temperature;
    const windSpeed = weatherData.current_weather.windspeed;
    const dailyMaxTemps = weatherData.daily.temperature_2m_max;
    const dailyMinTemps = weatherData.daily.temperature_2m_min;
    const dailyDates = weatherData.daily.time;

    let dailyReport = "";
    for (let i = 0; i < dailyDates.length; i++) {
      dailyReport += `<p>
    - <strong>${dailyDates[i]}</strong> temperatures from <strong>${dailyMinTemps[i]}</strong>°F 
   to <strong>${dailyMaxTemps[i]}°F</strong></p><br>
   
  `;
    }
    let isDay = "";
    weatherData.current_weather.is_day === 1
      ? (isDay = `<i class="fa-solid fa-sun day"></i>`)
      : (isDay = `<i class="fa-solid fa-moon night"></i>`);
    // Getting Air quality
    const airQualityResponse = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10`
    );
    const airQualityData = await airQualityResponse.json();

    // Get the latest value
    const pm10Values = airQualityData.hourly.pm10;
    const lastPM10 = pm10Values[pm10Values.length - 1];

    // Classification
    let airQualityStatus = "";
    if (lastPM10 <= 20) {
      airQualityStatus = "🟢 Good";
    } else if (lastPM10 <= 40) {
      airQualityStatus = "🟡 Fair";
    } else if (lastPM10 <= 60) {
      airQualityStatus = "🟠 Moderate";
    } else if (lastPM10 <= 100) {
      airQualityStatus = "🔴 Poor";
    } else if (lastPM10 <= 150) {
      airQualityStatus = "🟣 Very Poor";
    } else {
      airQualityStatus = "⚫ Extremely Poor";
    }
    weatherReportEl.style.display = "block";
    weatherReportEl.innerHTML = `
      <h3>Weather Report for ${name}, ${admin1}, ${country}</h3>
      <div class="air-quality">
        <div class="air-quality-header">
          <h4>Air Quality</h4>
          <span class="day-night-icon ">${isDay}</span>
        </div>
        <p>PM10: ${lastPM10} µg/m³</p>
        <p>Status: ${airQualityStatus}</p>
      </div>
      <div class="weather-info">
        <p class="temperature">🌡️ Temperature: ${temp}°F</p>
        <p class="windspeed">💨 Wind Speed: ${windSpeed} mph</p>
      </div>
      <div class="forecast">
        <h4>Next Days Forecast:</h4>
        ${dailyReport}
      </div>
    `;
  } catch (error) {
    messageEl.classList.add("error");
    messageEl.style.display = "block";
    messageEl.textContent = "❌ Something went wrong. Please try again later.";
  } finally {
    loadingEl.style.display = "none";
  }
});

// Footer
const year = new Date().getFullYear();
footerEl.innerHTML = `<p>&copy;Jose Izquierdo ${year}</p>
<a href="https://www.linkedin.com/in/jose-luis-izquierdo-hernandez-938064245" target="_blank"><i class="fa-brands fa-linkedin"></i></a>
<a href="https://github.com/jocl0110" target="_blank"><i class="fa-brands fa-github"></i></a>
<a href="https://x.com/jocl0110" target="_blank"><i class="fa-brands fa-x-twitter"></i></a>`;
