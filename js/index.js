// Elements
const submitBtnEl = document.getElementById("submit_btn");
const inputEl = document.getElementById("city_input");
const weatherReportEl = document.getElementById("weather_report");
const loadingEl = document.getElementById("loading");
const footerEl = document.getElementById("footer");

// Footer

submitBtnEl.addEventListener("click", async () => {
  const city = inputEl.value.trim();

  if (!city) {
    weatherReportEl.textContent = "Please enter a city name.";
    return;
  }

  loadingEl.style.display = "block";
  weatherReportEl.innerHTML = "";

  try {
    //   Get coordinates from city name
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const geoData = await geoResponse.json();
    console.log("Coordinates", geoData);
    if (!geoData.results || geoData.results.length === 0) {
      weatherReportEl.textContent = "City not found";
      return;
    }

    const { latitude, longitude, name, country, admin1 } = geoData.results[0];
    // Get Weather Data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const weatherData = await weatherResponse.json();
    console.log("Weather Data", weatherData);

    const temp = weatherData.current_weather.temperature;
    const windSpeed = weatherData.current_weather.windspeed;
    const dailyMaxTemps = weatherData.daily.temperature_2m_max;
    const dailyMinTemps = weatherData.daily.temperature_2m_min;
    const dailyDates = weatherData.daily.time;

    let dailyReport = "<h4>Next Days Forecast:</h4>";
    for (let i = 0; i < dailyDates.length; i++) {
      dailyReport += `
    📅 ${dailyDates[i]} <br>
    🔼 Max: ${dailyMaxTemps[i]}°F <br>
    🔽 Min: ${dailyMinTemps[i]}°F <br><br>
  `;
    }
    let isDay = "";
    weatherData.current_weather.is_day === 1
      ? (isDay = `<i class="fa-solid fa-sun"></i>`)
      : (isDay = `<i class="fa-solid fa-moon"></i>`);
    // Getting Air quality
    const airQualityResponse = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10`
    );
    const airQualityData = await airQualityResponse.json();
    console.log("Air Quality", airQualityData);

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
    setTimeout(() => {
      loadingEl.style.display = "none";
    }, 2000);
    weatherReportEl.innerHTML = `
      <h3>Weather Report for ${name}, ${admin1}, ${country}</h3>
      🌡️ Temperature: ${temp}°F <br>
      💨 Wind Speed: ${windSpeed} mph <br>
      ${isDay} <br>
      <h4>Air Quality</h4>
      PM10: ${lastPM10}} µg/m³ <br>
      Status: ${airQualityStatus}
      ${dailyReport}
    `;
  } catch (error) {
    console.error("Failed to get weather data", error);
    weatherReportEl.innerHTML = "Something went wrong. Please try again.";
  } finally {
    loadingEl.style.display = "none";
  }
});
