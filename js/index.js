console.log("Hello World!");
// Elements
const submitBtnEl = document.getElementById("submit_btn");
const inputEl = document.getElementById("city_input");
const weatherReportEl = document.getElementById("weather_report");

submitBtnEl.addEventListener("click", async () => {
  const city = inputEl.value.trim();

  if (!city) {
    weatherReportEl.textContent = "Please enter a city name.";
    return;
  }

  try {
    //   Get coordinates from city name
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const geoData = await geoResponse.json();
    console.log(geoData);
    if (!geoData.results || geoData.results.length === 0) {
      weatherReportEl.textContent = "City not found";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    // Get Weather Data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch`
    );
    const data = await weatherResponse.json();

    const temp = data.current_weather.temperature;
    const windSpeed = data.current_weather.windspeed;
    let isDay = "";
    data.current_weather.is_day === 1
      ? (isDay = `<i class="fa-solid fa-moon"></i>`)
      : (isDay = `<i class="fa-solid fa-sun"></i>`);

    weatherReportEl.innerHTML = `📍 Weather in ${name}, ${country}:<br>
      🌡️ Temperature: ${temp}°F <br>
      💨 Wind Speed: ${windSpeed} mph <br>
      ${isDay} <br><br>`;

    console.log(data);
  } catch (error) {
    console.error("Failed to get weather data", error);
  }
});
