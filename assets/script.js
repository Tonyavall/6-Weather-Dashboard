// HTML Elements
let inputBtn = document.getElementById('input-btn')
let savedBtns = document.querySelectorAll('#btn')
let searchCity = document.getElementById('search-city')
let userInput = document.querySelector('.user-input')
let searchState = document.getElementById('#search-state')

// Make sure savedBtns is a nodeList
// console.log(savedBtns)

// Check to see that searchInput element is returned
// console.log(searchInput)

let apiKey = b88df4fcabf5b35cee7f00e569859183;
let inputContainer = {
    city: '',
}

async function fetchCords() {
    let apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}'
    
    fetch(apiUrl)
        .then(response => {
            response.json()
        })
        .then(response => {
            let cords = [response.lat, response.lon]
            return cords
        })
        .catch(err => {
            console.error(err)
        })
}

async function fetchWeather() {
    let cords = fetchCords();
    let apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cords[0] + '&lon=' + cords[1] + '&appid=' + apiKey;

    fetch(apiUrl)
        .then(response => {
            response.json()
        })
        .then(response => {
            //statements to grab weather data
        })
        .catch(err => {
            console.error(err)
        })
}

// Handles form submission and stores user data into the local storage
let formSubmitHandler = function(event) {
    event.preventDefault();

    // need to JSON.stringify() data and then JSON.parse()
    let city = searchCity.value.trim();
    let state = searchState.value.trim();

    // Storing city data in inputContainer object
    inputContainer.city = city;
    // Storing city data into local storage
    localStorage.setItem('city', city)

    if (state === '') {
        fetchWeather();
    } else {
        inputContainer.state = state;
        localStorage.setItem('state', state)
        fetchWeather();
    }
}

userInput.addEventListener('submit', formSubmitHandler());
