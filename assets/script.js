// HTML Elements
let inputBtn = document.getElementById('input-btn')
let savedBtns = document.querySelectorAll('#btn')
let searchCity = document.getElementById('search-city')
let userInput = document.querySelector('.user-input')

// Make sure savedBtns is a nodeList
// console.log(savedBtns)

// Check to see that searchInput element is returned
// console.log(searchInput)

let apiKey = b88df4fcabf5b35cee7f00e569859183;

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
    let apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}'

    fetch(apiUrl)
        .then(response => {
            response.json()
        })
        .then(response => {
            //statements to grab weather data
        })
}

// Handles form submission and stores user data into the local storage
let formSubmitHandler = function(event) {
    event.preventDefault();

    // need to JSON.stringify() data and then JSON.parse()
    let city = searchCity.value.trim();

    localStorage.setItem('city', city)

    // Fetch weather upon form submission
    fetchWeather();
}

userInput.addEventListener('submit', formSubmitHandler());
