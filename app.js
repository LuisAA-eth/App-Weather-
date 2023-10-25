const apiKey = "3d368fc4580eba76d4ab78c70d390b60";
let chart;
let temperatures = [];
let humidities = [];
let temperaturaBase; // Guardar aquí la temperatura original en Celsius


document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("searchButton");
  const geolocationButton = document.getElementById("geolocationButton");
  const locationInput = document.getElementById("locationInput");
  const temperatureUnitElement = document.getElementById('temperatureUnit');
  
  // Evento para cambiar el modo oscuro con el nuevo interruptor
  document.getElementById("toggleDarkMode").addEventListener("change", function() {
    if (this.checked) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  });
  
  
   // Escuchar cambios en la unidad de temperatura
  temperatureUnitElement.addEventListener('change', function() {
    const selectedUnit = temperatureUnitElement.value;
    
    // Verificar si temperaturaBase es un número válido
    if (isNaN(temperaturaBase)) {
    console.error("temperaturaBase no es un número válido.");
    return; // Salir de la función
    }
    // Convertir la temperatura a la unidad seleccionada y actualizar la UI
    let convertedTemperature;
    if (selectedUnit === "Celsius") {
      convertedTemperature = temperaturaBase; // Usar el valor de la temperatura base
      document.getElementById('temperatureUnitDisplay').textContent = '°C';
    } else if (selectedUnit === "Fahrenheit") {
      convertedTemperature = (temperaturaBase * 9/5) + 32;
      document.getElementById('temperatureUnitDisplay').textContent = '°F';
    }
    
    document.getElementById('temperature').textContent = convertedTemperature.toFixed(0);
      });
    });




  // Evento para buscar el clima por ciudad
  searchButton.addEventListener("click", () => {
    const city = locationInput.value;
    if (city) {
      getWeather(city, apiKey);
      getForecast(city, apiKey);
    } else {
      displayError("Por favor, ingrese una ciudad.");
    }
  });

  // Evento para buscar el clima por geolocalización
  geolocationButton.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByCoords(lat, lon, apiKey);
      getForecastByCoords(lat, lon, apiKey);
    }, () => {
      displayError("Error al obtener la geolocalización.");
    });


  });

  


  function actualizarTemperaturaBase(nuevaTemperatura) {
    if (typeof nuevaTemperatura === 'number' && !isNaN(nuevaTemperatura)) {
      temperaturaBase = nuevaTemperatura;
    } else {
      console.error("actualizarTemperaturaBase: nuevaTemperatura no es un número válido.");
    }
  }


  // Funciones para manejar el modo oscuro
  function enableDarkMode() {
    document.body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
  }

  function disableDarkMode() {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", null);
  }

  // Función para mostrar errores
  function displayError(message) {
    document.getElementById("errorText").innerText = message;
  }

 

  
  async function getWeather(city, apiKey) {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
      
      if (!response.ok) {
        handleErrorResponse(response);
        return;
      }
  
      const data = await response.json();
      actualizarTemperaturaBase(data.main.temp);
      displayWeather(data);
  
      if (data.coord) {
        const { lat, lon } = data.coord;
        fetchAirQuality(lat, lon);
      }
  
    } catch (error) {
      document.getElementById("errorText").innerText = "Error al obtener el clima.";
    }
  }
  
  async function handleErrorResponse(response) {
    const errorData = await response.json();
    document.getElementById("errorText").innerText = errorData.message || "Error al obtener el clima.";
  }
  
  
  //Manejar la conversion de la temperatura
  function convertAndDisplayTemperature() {
    const selectedUnit = document.getElementById('temperatureUnit').value;
    let convertedTemperature;
    if (selectedUnit === "Celsius") {
      convertedTemperature = temperaturaBase;
      document.getElementById('temperatureUnitDisplay').textContent = '°C';
    } else if (selectedUnit === "Fahrenheit") {
      convertedTemperature = (temperaturaBase * 9/5) + 32;
      document.getElementById('temperatureUnitDisplay').textContent = '°F';
    }
    document.getElementById('temperature').textContent = convertedTemperature.toFixed(0);
  }



  async function getWeatherByCoords(lat, lon, apiKey) {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      if (!response.ok) {
        const errorData = await response.json();
        displayError(`Error al obtener el clima: ${errorData.message}`);
        return;
      }
      const data = await response.json();
      // Actualiza la temperatura base en Celsius
      temperaturaBase = data.main.temp;
      displayWeather(data);
      fetchAirQuality(lat, lon);  // Llamada a la función para obtener la calidad del aire
      getHourlyForecast(lat, lon, apiKey);
      convertAndDisplayTemperature();
    } catch (error) {
      displayError(`Excepción al obtener el clima: ${error}`);
    }
  }
  
  // Función para mostrar errores
  function displayError(message) {
    document.getElementById("errorText").innerText = message;
  }
  
  

  function displayWeather(data) {
    document.getElementById("locationName").innerText = data.name;
    document.getElementById("temperature").innerText = data.main.temp.toFixed(0);
    document.getElementById("conditions").innerText = data.weather[0].description;
    document.getElementById("humidity").innerText = data.main.humidity;
    document.getElementById("windSpeed").innerText = data.wind.speed;
    document.getElementById("pressure").innerText = data.main.pressure;
    document.getElementById("visibility").innerText = data.visibility;
    //document.getElementById("weatherIcon").src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    
    // Determinar qué imagen de clima mostrar según el estado del clima
  let condition = data.weather[0].main;
  console.log(condition);
  let gifPath;

  if (condition === "Drizzle") {
    gifPath = 'img/lluvia.gif'; // Ruta a la imagen de clima lluvioso
  } else if (condition === 'Clear') {
    gifPath = 'img/soleado.gif'; // Ruta a la imagen de clima soleado
  } else if (condition === 'Snow') {
    gifPath = 'img/nieve.gif'; // Ruta a la imagen de clima de nieve
  } else if (condition === "clouds"){
    gifPath = 'img/nublado.gif'; // Ruta a una imagen por defecto para otros estados
  } else if (condition === "Thunderstorm"){
    gifPath = "img/tormenta.gif";
  } else if (condition === 'Mist' || condition === 'Fog'){
    gifPath = 'img/neblina.gif';
  } else {
    gifPath = "img/P2D.gif";
  }

  // Actualizar el atributo 'src' de la imagen del clima
  document.getElementById("weatherIcon").src = gifPath;
    
  getUVIndex(data.coord.lat, data.coord.lon, apiKey);
    displayError("");
}

  
  async function getUVIndex(lat, lon, apiKey) {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      if (!response.ok) {
        const data = await response.json();
        console.log("Error al obtener el índice UV:", data);
        document.getElementById("uvIndex").innerText = "Error al obtener el índice UV.";
        return;
      }
      const data = await response.json();
      console.log("Datos del índice UV:", data);  // Depuración
      document.getElementById("uvIndex").innerText = data.value;
    } catch (error) {
      console.log("Excepción al obtener el índice UV:", error);  // Depuración
      document.getElementById("uvIndex").innerText = "Error al obtener el índice UV.";
    }
  }
  

  async function getHourlyForecast(lat, lon, apiKey) {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const data = await response.json();
      displayHourlyForecast(data);
    } catch (error) {
      console.error("Error detallado:", error);
      document.getElementById("errorText").innerText = "Error al obtener el pronóstico por horas.";
    }
  }


  
  function displayGrafico(temperatures, humidities) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    if (!chart){
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5'], // Puede cambiar esto según sus datos
        datasets: [
          {
            label: 'Temperatura (°C)',
            data: temperatures,
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false
          },
          {
            label: 'Humedad (%)',
            data: humidities,
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false
          }
        ]
      },
      options: {
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
   } else {  // Si el gráfico ya existe, actualízalo
    chart.data.datasets[0].data = temperatures;
    chart.data.datasets[1].data = humidities;
    chart.update();
  }
}

  // función para mostrar el gráfico
   displayGrafico(temperatures, humidities);
  
  async function getForecast(city, apiKey) {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
      const data = await response.json();
      displayForecast(data);
    } catch (error) {
      console.error("Error detallado:", error);
      document.getElementById("errorText").innerText = "Error al obtener el pronóstico.";
    }
  }
  
  async function getForecastByCoords(lat, lon, apiKey) {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const data = await response.json();
      displayForecast(data);
    } catch (error) {
      console.error("Error detallado:", error);
      document.getElementById("errorText").innerText = "Error al obtener el pronóstico.";
    }
  }


  //Obtener el pronostico por horas
  function displayHourlyForecast(data) {
    const hourlyForecastContainer = document.getElementById("hourlyForecast");
    hourlyForecastContainer.innerHTML = "";
    for (let i = 0; i < 8; i++) {  // Asumiendo que desea mostrar el pronóstico para las próximas 8 horas
      const dt = new Date(data.list[i].dt * 1000);
      const time = dt.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const hourlyForecastItem = `
        <div class="hourly-forecast-item">
          <h3 class="hourly-time">${time}</h3>
          <p>Temp: ${data.list[i].main.temp}°C</p>
          <p>Cond: ${data.list[i].weather[0].description}</p>
        </div>
      `;
      hourlyForecastContainer.innerHTML += hourlyForecastItem;
    }
  }
  
  //Obtener el pronostico por dias
  
  function displayForecast(data) {
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";
    
    for (let i = 0; i < data.list.length; i += 8) {
      const dt = new Date(data.list[i].dt * 1000);
      const dayName = dt.toLocaleString('es-ES', { weekday: 'long' });
    
      // Llenar los arrays con los datos de temperatura y humedad
      temperatures.push(data.list[i].main.temp);
      humidities.push(data.list[i].main.humidity);
      
      const forecastItem = `
        <div class="forecast-item">
          <h3 class="forecast-day">${dayName}</h3>
          <p>${data.list[i].dt_txt}</p>
          <p>Temp: ${data.list[i].main.temp}°C</p>
          <p>Cond: ${data.list[i].weather[0].description}</p>
        </div>
      `;
      forecastContainer.innerHTML += forecastItem;
    }
    // Llamar a la función para mostrar el gráfico
    displayGrafico(temperatures, humidities);
  }


  function fetchAirQuality(lat, lon) {
    
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => displayAirQuality(data))
      .catch(error => console.error("Error al obtener calidad del aire:", error));
  }
  
  function displayAirQuality(data) {
    const aqi = data.list[0].main.aqi;
    const pm25 = data.list[0].components.pm2_5;
    const pm10 = data.list[0].components.pm10;
  
    document.getElementById("aqi").textContent = aqi;
    document.getElementById("pm25").textContent = pm25;
    document.getElementById("pm10").textContent = pm10;
  }

  