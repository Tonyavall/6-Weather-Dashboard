// HTML Elements
let inputBtn = document.getElementById('input-btn')
let savedBtns = document.querySelectorAll('#btn')
let searchCity = document.getElementById('search-city')
let userInput = document.querySelector('.user-input')
let searchState = document.getElementById('search-state')
let statusContainer = document.getElementById('status-container')
let uvContainer = document.querySelector('.uv-container')
let statusDate = document.querySelector('.status-date')
let uvP = document.querySelector('.uv-p')
let forecastDayContainers = document.querySelectorAll('#forecast-day')

// Pulling current date

// Make sure savedBtns is a nodeList
// console.log(savedBtns)

// Check to see that userInput element is returned
// console.log(userInput)

let apiKey = 'b88df4fcabf5b35cee7f00e569859183';
let inputContainer = {
    city: '',
    // optional state property
    // state: ''
}
let cords = {
    // example
    // lat: number,
    // lon: number
}
let cordsResults = {
    // example
    // name: 'Sacramento',
    // state: 'California'
}

let appendContent = (obj) => {
    let content = document.createElement(obj.tag)
    let keys = Object.keys(obj.setAttr)
    let values = Object.values(obj.setAttr)

    //Looping over object setAttr keys and values and setting it as contents attributes
    for (var i = 0; i < keys.length; i++) {
        content.setAttribute(keys[i], values[i])
    }

    if ('textContent' in obj) {
        let contentContent = document.createTextNode(obj.textContent)
        content.appendChild(contentContent)
    }

    if ('insertAfter' in obj) {
        obj.appendTo.appendChild(content)
        content.after(obj.insertAfter)
    } else if ('insertBefore' in obj) {
        obj.appendTo.appendChild(content)
        content.before(obj.insertBefore)
    } else {
        obj.appendTo.appendChild(content)
    }
}

function apiCondition() {
    let city = inputContainer.city

    if ("state" in inputContainer) {
        let state = inputContainer.state
        let apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + ',' + state + '&appid=' + apiKey;
        return apiUrl
    } else {
        let apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&appid=' + apiKey;
        return apiUrl
    }
}

function fetchCords() {
    let apiUrl = apiCondition()
    return fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            cords.lat = response[0].lat;
            cords.lon = response[0].lon;
            cordsResults.city = response[0].name;
            cordsResults.state = response[0].state;
        })
        .catch(err => {
            console.error(err)
        })
}

async function fetchWeatherCurrent() {
    await fetchCords();

    let apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cords.lat + '&lon=' + cords.lon + '&appid=' + apiKey;

    console.log(apiUrl)

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Appending reponse data to status container
            statusDate.textContent = cordsResults.city + ' ' + '(' + grabDate() + ')';

            const TEMP = {
                tag: 'p',
                setAttr: {
                    class: 'temp',
                },
                textContent: 'Temperature: ' + kelvinToFar(response.current.temp) + 'F',
                appendTo: statusContainer,
            }
            appendContent(TEMP)

            const WIND = {
                tag: 'p',
                setAttr: {
                    class: 'wind',
                },
                textContent: 'Wind Speed: ' + response.current.wind_speed + ' MPH',
                appendTo: statusContainer,
            }
            appendContent(WIND)

            const HUMIDITY = {
                tag: 'p',
                setAttr: {
                    class: 'humidity',
                },
                textContent: 'Humidity: ' + response.current.humidity + '%',
                appendTo: statusContainer,
            }
            appendContent(HUMIDITY)

            uvP.textContent = 'UV Index:'
            const UVINDEX = {
                tag: 'p',
                setAttr: {
                    class: 'uv-index',
                },
                textContent: response.current.uvi,
                appendTo: uvContainer,
            }
            appendContent(UVINDEX)
            // uvIndexColor()
        })
        .catch(err => {
            console.error(err)
        })
}

async function fetchWeatherPast() {
    await fetchCords()

    const YESTERDAY = grabUnix() - 86400;
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + YESTERDAY + '&appid=' + apiKey

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Appending reponse data to past forecast day containers
            const DATE = {
                tag: 'h3',
                setAttr: {
                    class: 'fore-date',
                },
                textContent: unixToDate(response.current.dt),
                appendTo: forecastDayContainers[0],
            }
            appendContent(DATE)

            const ICON_CONTAINER = {
                tag: 'div',
                setAttr: {
                    id: 'weather-icon',
                    style: "background-image: url('http://openweathermap.org/img/w/" + response.current.weather[0].icon + ".png'); background-repeat: no-repeat;",
                },
                appendTo: forecastDayContainers[0],
            }
            appendContent(ICON_CONTAINER)

            const TEMP = {
                tag: 'p',
                setAttr: {
                    class: 'fore-temp',
                },
                textContent: 'Temp: ' + kelvinToFar(response.current.temp) + 'F',
                appendTo: forecastDayContainers[0]
            }
            appendContent(TEMP)

            const WIND = {
                tag: 'p',
                setAttr: {
                    class: 'fore-wind',
                },
                textContent: 'Wind: ' + response.current.wind_speed + 'MPH',
                appendTo: forecastDayContainers[0]
            }
            appendContent(WIND)

            const HUMIDITY = {
                tag: 'p',
                setAttr: {
                    class: 'fore-humidity',
                },
                textContent: 'Humidity: ' + response.current.humidity + '%',
                appendTo: forecastDayContainers[0]
            }
            appendContent(HUMIDITY)
        })
        .catch(err => {
            console.error(err)
        })

    const DAYTWO = YESTERDAY - 86400;
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + DAYTWO + '&appid=' + apiKey

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Appending reponse data to past forecast day containers
            const DATE = {
                tag: 'h3',
                setAttr: {
                    class: 'fore-date',
                },
                textContent: unixToDate(response.current.dt),
                appendTo: forecastDayContainers[1],
            }
            appendContent(DATE)

            const ICON_CONTAINER = {
                tag: 'div',
                setAttr: {
                    id: 'weather-icon',
                    style: "background-image: url('http://openweathermap.org/img/w/" + response.current.weather[0].icon + ".png'); background-repeat: no-repeat;",
                },
                appendTo: forecastDayContainers[1],
            }
            appendContent(ICON_CONTAINER)

            const TEMP = {
                tag: 'p',
                setAttr: {
                    class: 'fore-temp',
                },
                textContent: 'Temp: ' + kelvinToFar(response.current.temp) + 'F',
                appendTo: forecastDayContainers[1]
            }
            appendContent(TEMP)

            const WIND = {
                tag: 'p',
                setAttr: {
                    class: 'fore-wind',
                },
                textContent: 'Wind: ' + response.current.wind_speed + 'MPH',
                appendTo: forecastDayContainers[1]
            }
            appendContent(WIND)

            const HUMIDITY = {
                tag: 'p',
                setAttr: {
                    class: 'fore-humidity',
                },
                textContent: 'Humidity: ' + response.current.humidity + '%',
                appendTo: forecastDayContainers[1]
            }
            appendContent(HUMIDITY)
        })
        .catch(err => {
            console.error(err)
        })

    const DAYTHREE = DAYTWO - 86400;
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + DAYTHREE + '&appid=' + apiKey

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Appending reponse data to past forecast day containers
            const DATE = {
                tag: 'h3',
                setAttr: {
                    class: 'fore-date',
                },
                textContent: unixToDate(response.current.dt),
                appendTo: forecastDayContainers[2],
            }
            appendContent(DATE)

            const ICON_CONTAINER = {
                tag: 'div',
                setAttr: {
                    id: 'weather-icon',
                    style: "background-image: url('http://openweathermap.org/img/w/" + response.current.weather[0].icon + ".png'); background-repeat: no-repeat;",
                },
                appendTo: forecastDayContainers[2],
            }
            appendContent(ICON_CONTAINER)

            const TEMP = {
                tag: 'p',
                setAttr: {
                    class: 'fore-temp',
                },
                textContent: 'Temp: ' + kelvinToFar(response.current.temp) + 'F',
                appendTo: forecastDayContainers[2]
            }
            appendContent(TEMP)

            const WIND = {
                tag: 'p',
                setAttr: {
                    class: 'fore-wind',
                },
                textContent: 'Wind: ' + response.current.wind_speed + 'MPH',
                appendTo: forecastDayContainers[2]
            }
            appendContent(WIND)

            const HUMIDITY = {
                tag: 'p',
                setAttr: {
                    class: 'fore-humidity',
                },
                textContent: 'Humidity: ' + response.current.humidity + '%',
                appendTo: forecastDayContainers[2]
            }
            appendContent(HUMIDITY)
        })
        .catch(err => {
            console.error(err)
        })

    const DAYFOUR = DAYTHREE - 86400;
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + DAYFOUR + '&appid=' + apiKey

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Appending reponse data to past forecast day containers
            const DATE = {
                tag: 'h3',
                setAttr: {
                    class: 'fore-date',
                },
                textContent: unixToDate(response.current.dt),
                appendTo: forecastDayContainers[3],
            }
            appendContent(DATE)

            const ICON_CONTAINER = {
                tag: 'div',
                setAttr: {
                    id: 'weather-icon',
                    style: "background-image: url('http://openweathermap.org/img/w/" + response.current.weather[0].icon + ".png'); background-repeat: no-repeat;",
                },
                appendTo: forecastDayContainers[3],
            }
            appendContent(ICON_CONTAINER)

            const TEMP = {
                tag: 'p',
                setAttr: {
                    class: 'fore-temp',
                },
                textContent: 'Temp: ' + kelvinToFar(response.current.temp) + 'F',
                appendTo: forecastDayContainers[3]
            }
            appendContent(TEMP)

            const WIND = {
                tag: 'p',
                setAttr: {
                    class: 'fore-wind',
                },
                textContent: 'Wind: ' + response.current.wind_speed + 'MPH',
                appendTo: forecastDayContainers[3]
            }
            appendContent(WIND)

            const HUMIDITY = {
                tag: 'p',
                setAttr: {
                    class: 'fore-humidity',
                },
                textContent: 'Humidity: ' + response.current.humidity + '%',
                appendTo: forecastDayContainers[3]
            }
            appendContent(HUMIDITY)
        })
        .catch(err => {
            console.error(err)
        })

    const DAYFIVE = DAYFOUR - 86400;
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + DAYFIVE + '&appid=' + apiKey

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Appending reponse data to past forecast day containers
            const DATE = {
                tag: 'h3',
                setAttr: {
                    class: 'fore-date',
                },
                textContent: unixToDate(response.current.dt),
                appendTo: forecastDayContainers[4],
            }
            appendContent(DATE)

            const ICON_CONTAINER = {
                tag: 'div',
                setAttr: {
                    id: 'weather-icon',
                    style: "background-image: url('http://openweathermap.org/img/w/" + response.current.weather[0].icon + ".png'); background-repeat: no-repeat;",
                },
                appendTo: forecastDayContainers[4],
            }
            appendContent(ICON_CONTAINER)

            const TEMP = {
                tag: 'p',
                setAttr: {
                    class: 'fore-temp',
                },
                textContent: 'Temp: ' + kelvinToFar(response.current.temp) + 'F',
                appendTo: forecastDayContainers[4]
            }
            appendContent(TEMP)

            const WIND = {
                tag: 'p',
                setAttr: {
                    class: 'fore-wind',
                },
                textContent: 'Wind: ' + response.current.wind_speed + 'MPH',
                appendTo: forecastDayContainers[4]
            }
            appendContent(WIND)

            const HUMIDITY = {
                tag: 'p',
                setAttr: {
                    class: 'fore-humidity',
                },
                textContent: 'Humidity: ' + response.current.humidity + '%',
                appendTo: forecastDayContainers[4]
            }
            appendContent(HUMIDITY)
        })
        .catch(err => {
            console.error(err)
        })

}

// function uvIndexColor() {

// }

// Converting Kelvin to F
function kelvinToFar(k) {
    f = (1.8 * (k - 273.15)) + 32;
    return parseInt(f)
}

// Converting unix time to date
function unixToDate(unix) {
    let unixT = unix
    let date = new Date(unixT * 1000)

    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0');
    let yyyy = date.getFullYear();

    date = mm + '/' + dd + '/' + yyyy;
    return date
}

// Grabbing current date https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript#:~:text=Use%20new%20Date()%20to,the%20current%20date%20and%20time.&text=This%20will%20give%20you%20today's,to%20whatever%20format%20you%20wish.
function grabDate() {
    let today = new Date()
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    return today
}

function grabUnix() {
    var ts = Math.round((new Date()).getTime() / 1000);
    return ts
}

// Handles form submission and stores user data into the local storage
let formSubmitHandler = function (event) {
    event.preventDefault();

    // need to JSON.stringify() data and then JSON.parse()
    let city = searchCity.value.trim();
    let state = searchState.value.trim();

    // Storing city data in inputContainer object
    inputContainer.city = city;
    // Storing city data into local storage
    // localStorage.setItem('city', city)

    if (state === '') {
        fetchWeatherCurrent();
        fetchWeatherPast();
    } else {
        inputContainer.state = state;
        // localStorage.setItem('state', state)
        fetchWeatherCurrent();
        fetchWeatherPast();
    }
}

userInput.addEventListener('submit', formSubmitHandler);