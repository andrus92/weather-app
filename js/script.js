const API_KEY = '8629a6d80dcc3eebcaab0691c70d49a8';

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Fahrenheit2Celsius = (t) => Math.round(t - 273.15);

const detailsBtn = document.querySelector('.btn-details');
const weatherHeader = document.querySelector('.weather-header');
const weatherDetails = document.querySelector('.weather-details');
const weatherInfo = document.querySelector('.weather-info');
const weatherGeneralInfo = document.querySelector('.weather-general-info');
const microphoneBtn = document.querySelector('.microphone');
const searchBtn = document.querySelector('.search');
const locationBtn = document.querySelector('.location');
const input = document.querySelector('.input');

const handleSearch = () => {
    if (input.value === '') {
        weatherHeader.classList.add('weather-header_alert');
        setTimeout(() => {
            weatherHeader.classList.remove('weather-header_alert');
        }, 1000)
    } else {
        getWeather(true, input.value);
        input.value = '';
    }
}

searchBtn.addEventListener('click', () => {
    handleSearch();
});

input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
    }
});

locationBtn.addEventListener('click', () => {
    getWeather(false);
    input.value = '';
});

microphoneBtn.addEventListener('click', () => {
    input.value = '';
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    const commands = ['find', 'search'];

    function handleSpeech(speechEvent) {
        const transcript = Array.from(speechEvent.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join(' ');
        ;
        
        if (speechEvent.results[0].isFinal) {
            recognition.stop();

            const filterRes = commands.filter(cmd => transcript.toLowerCase().endsWith(cmd));
            if (filterRes.length !== 0) {
                input.value = transcript.substring(0, transcript.length - filterRes[0].length);
                handleSearch();
            } else {
                input.value = transcript;
            }
        }
    }

    recognition.start();
    recognition.addEventListener('result', handleSpeech);
});

detailsBtn.addEventListener('click', () => {
    detailsBtn.classList.toggle('btn-details_active');
    weatherDetails.classList.toggle('weather-details_invisible');
});

const getWeather = (isSpecificCity, cityName) => {

    const loaderHtml = `
        <li class="loader">
            <div class="loader-circle loader-circle1"></div>
            <div class="loader-circle loader-circle2"></div>
            <div class="loader-circle loader-circle3"></div>
            <div class="loader-circle loader-circle4"></div>
        </li>
    `;

    weatherGeneralInfo.innerHTML = loaderHtml;
    weatherDetails.innerHTML = loaderHtml;

    if (isSpecificCity) {
        getCityData(cityName);
    } else {
        getCurrentLocation();
    }
};

const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        getGeoData(position.coords.latitude, position.coords.longitude);
})};

const getGeoData = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => displayData(data))
        .catch(error => {
            displayError();
        });
    ;
};

const getCityData = (cityName) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => displayData(data))
        .catch(error => {
            displayError();
        });
};

const displayData = (data) => {

    weatherGeneralInfo.innerHTML = `
        <div class="info-left">
            <span class="city">${data.name}</span>
            <span class="temperature">${Fahrenheit2Celsius(data.main.temp)} °C</span>
            <span class="feels-like">Feels like: ${Fahrenheit2Celsius(data.main.feels_like)} °C</span>
        </div>
        <div class="info-right">
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
            </div>
        </div>
    `;

    weatherDetails.innerHTML = `
        <li class="weather-detail">
            <div class="detail-title">Conclusion</div>
            <div class="detail-value">${data.weather[0].description}</div>
        </li>
        <li class="weather-detail">
            <div class="detail-title">Humidity</div>
            <div class="detail-value">${data.main.humidity} %</div>
        </li>
        <li class="weather-detail">
            <div class="detail-title">Pressure</div>
            <div class="detail-value">${data.main.pressure} hPa</div>
        </li>
        <li class="weather-detail">
            <div class="detail-title">Wind speed</div>
            <div class="detail-value">${Math.round(data.wind.speed)} m/s</div>
        </li>
    `;

    detailsBtn.classList.remove('btn-details_invisible');
}

const displayError = () => {
    weatherGeneralInfo.innerHTML = '';

    weatherGeneralInfo.innerHTML = `
        <div class="sorry">
            <div class="icon">
                <img src="./img/sad-smile.svg" alt="sad-smile">
            </div>
            <span class="sorry-text">Sorry, maybe you<br>miswrote the city</span>
        </div>
    `;

    detailsBtn.classList.add('btn-details_invisible');
    weatherDetails.classList.add('weather-details_invisible');
}

getWeather(false);

