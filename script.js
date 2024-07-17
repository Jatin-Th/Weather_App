const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".main-container");
const grantAccessContainer = document.querySelector(".grant-locationContainer");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const errorimg = document.querySelector("[error-img]");
const errormsg = document.querySelector("[error-msg]");
const errorContainer = document.querySelector("[error-container]");

let currentTab = userTab;
const API_KEY = "4b39c7d66b754f386df719db64ffee0e";
currentTab.classList.add("current-tab");
getfromSessionStorage();

userTab.addEventListener("click", () => {
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

function switchTab(clickedTab) {
  errorContainer.classList.remove("active");
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      getfromSessionStorage();
    }
  }
}

function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;

  //make grant container invisible
  grantAccessContainer.classList.remove("active");

  loadingScreen.classList.add("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    const data = await response.json();

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");

    renderWeatherInfo(data);
  } catch (err) {
    // // Create an error message element
    // const errorMessage = document.createElement('p');
    // errorMessage.textContent = "Couldnt fetch local Coordinates. Please try again.";

    // // Create an error image element
    // const errorImg = document.createElement('img');
    // errorImg.src = './images/not-found.png';
    // errorImg.alt = 'City not found';

    // // Clear previous content and append error message and image
    // userInfoContainer.innerHTML = '';
    // userInfoContainer.appendChild(errorMessage);
    // userInfoContainer.appendChild(errorImg);

    // // Update loading and container visibility
    // loadingScreen.classList.remove("active");
    // userInfoContainer.classList.add("active");
    loadingScreen.classList.remove("active");
    errorContainer.classList.add("active");
    errormsg.innerText = `${err?.message}, UNABLE TO FETCH LOCAL COORDINATES`;
  }
}

function renderWeatherInfo(weatherInfo) {
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const description = document.querySelector("[data-weatherDescription]");
  const WeatherIcon = document.querySelector("[data-WeatherIcon]");
  const temp = document.querySelector("[data-temperature]");
  const windspeed = document.querySelector("[data-windSpeed]");
  const humid = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  //fetching values from weather object
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  description.innerText = weatherInfo?.weather?.[0].description;
  WeatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0].icon}.png`;
  const num = weatherInfo?.main?.temp - 273.15;
  const temperature = num.toFixed(2);
  temp.innerText = `${temperature}°C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
  humid.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    grantAccessButton.style.display = "none";
    alert("No Geolocation Support Available in the Browser");
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = searchInput.value;

  if (cityName === "") return;
  else fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  grantAccessContainer.classList.remove("active");
  userInfoContainer.classList.remove("active");
  errorContainer.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
    );
    const data = await response.json();
    if (!data.sys) {
      throw data;
    }

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    errorContainer.classList.add("active");
    errormsg.innerText = `${err?.message}`;
  }
}
