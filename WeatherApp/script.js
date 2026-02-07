const API_KEY = '22a1da615de637dc0ba6f65d7f1d8d99';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('search');
const locationBtn = document.getElementById('locationBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const weatherContainer = document.getElementById('weatherContainer');
const unitButtons = document.querySelectorAll('.unit-btn');

let currentUnit = 'metric';
let currentCity = '';

function getWeatherIcon(iconCode) {
  const iconMap = {
    '01d': 'fas fa-sun',
    '01n': 'fas fa-moon',
    '02d': 'fas fa-cloud-sun',
    '02n': 'fas fa-cloud-moon',
    '03d': 'fas fa-cloud',
    '03n': 'fas fa-cloud',
    '04d': 'fas fa-cloud',
    '04n': 'fas fa-cloud',
    '09d': 'fas fa-cloud-showers-heavy',
    '09n': 'fas fa-cloud-showers-heavy',
    '10d': 'fas fa-cloud-sun-rain',
    '10n': 'fas fa-cloud-moon-rain',
    '11d': 'fas fa-bolt',
    '11n': 'fas fa-bolt',
    '13d': 'fas fa-snowflake',
    '13n': 'fas fa-snowflake',
    '50d': 'fas fa-smog',
    '50n': 'fas fa-smog'
  };
  return iconMap[iconCode] || 'fas fa-cloud-sun';
}

function formatDate(timestamp, format = 'full') {
  const date = new Date(timestamp * 1000);

  if (format === 'full') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (format === 'time') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}

function convertTemp(temp, fromUnit = 'metric', toUnit = 'metric') {
  if (fromUnit === toUnit) return Math.round(temp);
  if (toUnit === 'imperial') return Math.round((temp * 9 / 5) + 32);
  return Math.round((temp - 32) * 5 / 9);
}

function getTempUnit(unit = 'metric') {
  return unit === 'metric' ? '°C' : '°F';
}

function getWindUnit(unit = 'metric') {
  return unit === 'metric' ? 'km/h' : 'mph';
}

function convertWindSpeed(speed, fromUnit = 'metric', toUnit = 'metric') {
  if (fromUnit === toUnit) return speed.toFixed(1);
  if (toUnit === 'imperial') return (speed * 0.621371).toFixed(1);
  return (speed / 0.621371).toFixed(1);
}

function showLoading() {
  loading.style.display = 'block';
  errorMessage.style.display = 'none';
  weatherContainer.style.display = 'none';
}

function hideLoading() {
  loading.style.display = 'none';
}

function showError(message) {
  hideLoading();
  errorText.textContent = message;
  errorMessage.style.display = 'block';
  weatherContainer.style.display = 'none';
}

function updateCurrentWeather(data) {
  document.getElementById('cityText').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('currentDate').textContent = formatDate(data.dt, 'full');

  const iconClass = getWeatherIcon(data.weather[0].icon);
  document.getElementById('weatherIconLarge').innerHTML = `<i class="${iconClass}"></i>`;

  const temp = Math.round(data.main.temp);
  document.getElementById('temperature').textContent = `${temp}${getTempUnit(currentUnit)}`;

  document.getElementById('condition').textContent = data.weather[0].main;

  const feelsLike = Math.round(data.main.feels_like);
  document.getElementById('feelsLike').textContent = `Feels like ${feelsLike}${getTempUnit(currentUnit)}`;

  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('windSpeed').textContent = `${data.wind.speed} ${getWindUnit(currentUnit)}`;
  document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

  const visibility = (data.visibility / 1000).toFixed(1);
  document.getElementById('visibility').textContent = `${visibility} km`;

  document.getElementById('sunrise').textContent = formatDate(data.sys.sunrise, 'time');
  document.getElementById('sunset').textContent = formatDate(data.sys.sunset, 'time');

  updateBackground(data.weather[0].main);
}

function updateBackground(condition) {
  const body = document.querySelector('.background-animation');
  const gradients = {
    'Clear': 'linear-gradient(135deg, #667eea, #764ba2)',
    'Clouds': 'linear-gradient(135deg, #4e54c8, #8f94fb)',
    'Rain': 'linear-gradient(135deg, #00467f, #a5cc82)',
    'Drizzle': 'linear-gradient(135deg, #4ca1af, #c4e0e5)',
    'Thunderstorm': 'linear-gradient(135deg, #2c3e50, #4ca1af)',
    'Snow': 'linear-gradient(135deg, #e6dada, #274046)',
    'Mist': 'linear-gradient(135deg, #606c88, #3f4c6b)',
    'Smoke': 'linear-gradient(135deg, #606c88, #3f4c6b)',
    'Haze': 'linear-gradient(135deg, #606c88, #3f4c6b)',
    'Dust': 'linear-gradient(135deg, #cbb4d4, #20002c)',
    'Fog': 'linear-gradient(135deg, #606c88, #3f4c6b)',
    'Sand': 'linear-gradient(135deg, #cbb4d4, #20002c)',
    'Ash': 'linear-gradient(135deg, #606c88, #3f4c6b)',
    'Squall': 'linear-gradient(135deg, #0f0c29, #302b63)',
    'Tornado': 'linear-gradient(135deg, #0f0c29, #302b63)'
  };

  body.style.background = gradients[condition] || 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
}

async function getCurrentWeather(city) {
  const url = `${API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('City not found. Please check the spelling and try again.');
    }
    throw new Error('Failed to fetch weather data. Please try again later.');
  }

  return await response.json();
}

async function getWeatherByCoords(lat, lon) {
  const weatherUrl = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;

  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    throw new Error('Failed to fetch weather data for your location.');
  }

  return await weatherResponse.json();
}

async function getWeather(city) {
  if (!city || city.trim() === '') {
    showError('Please enter a city name.');
    return;
  }

  currentCity = city.trim();
  showLoading();

  try {
    const currentWeather = await getCurrentWeather(currentCity);

    updateCurrentWeather(currentWeather);

    hideLoading();
    errorMessage.style.display = 'none';
    weatherContainer.style.display = 'block';

    saveToRecentSearches(currentCity);

  } catch (error) {
    console.error('Error fetching weather:', error);
    showError(error.message);
  }
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const data = await getWeatherByCoords(latitude, longitude);

        updateCurrentWeather(data);

        currentCity = data.name;

        hideLoading();
        errorMessage.style.display = 'none';
        weatherContainer.style.display = 'block';

        saveToRecentSearches(currentCity);

      } catch (error) {
        console.error('Error fetching weather:', error);
        showError(error.message);
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
      showError('Unable to retrieve your location. Please enter a city manually.');
    }
  );
}

function saveToRecentSearches(city) {
  let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

  recentSearches = recentSearches.filter(item => item.toLowerCase() !== city.toLowerCase());

  recentSearches.unshift(city);

  recentSearches = recentSearches.slice(0, 5);

  localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
}

function getRecentSearches() {
  return JSON.parse(localStorage.getItem('recentSearches')) || [];
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (city) {
    getWeather(city);
    searchInput.value = '';
  }
});

locationBtn.addEventListener('click', () => {
  getCurrentLocation();
});

unitButtons.forEach(button => {
  button.addEventListener('click', () => {
    unitButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const newUnit = button.getAttribute('data-unit');

    if (newUnit !== currentUnit && currentCity) {
      currentUnit = newUnit;
      getWeather(currentCity);
    } else {
      currentUnit = newUnit;
    }
  });
});

let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
});

function init() {
  const recentSearches = getRecentSearches();
  console.log('Weather App initialized');
  console.log('Recent searches:', recentSearches);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
