// HTML Elements
let inputBtn = document.getElementById('input-btn')
let savedBtns = document.querySelectorAll('#btn')
let searchCity = document.getElementById('search-city')
let userInput = document.querySelector('.user-input')
let searchState = document.getElementById('search-state')
let statusContainer = document.getElementById('status-container')
let statusDate = document.querySelector('.status-date')
let forecastContainer = document.getElementById('forecast-container')
let forecastDayContainers = document.querySelectorAll('#forecast-day')
let uvContainer = document.querySelector('.uv-container')
let preLoader = document.querySelector('.preloader')
let rightArticle = document.querySelector('.right-article')
let savedCities = document.getElementById('saved-cities')

// Make sure savedBtns is a nodeList
// console.log(savedBtns)

// Check to see that userInput element is returned
// console.log(userInput)

let apiKey = 'b88df4fcabf5b35cee7f00e569859183';
let apiKey2 = '7423690088d431deeb7881c189cccd22';
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
    // city: 'Sacramento',
    // state: 'California'
}

// Takes in object parameter with html attributes as its properties and appends it
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

    if ('insertBefore' in obj) {
        obj.appendTo.appendChild(content)
        obj.insertBefore[0].insertBefore(content, obj.insertBefore[1])
        return content
    } else {
        obj.appendTo.appendChild(content)
        return content
    }
}

appendPastCities()

function apiCondition() {
    let city = inputContainer.city

    if ("state" in inputContainer) {
        let state = inputContainer.state
        let apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + ',' + state + '&appid=' + apiKey2;
        return apiUrl
    } else {
        let apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&appid=' + apiKey2;
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
            if (response.length === 0) {
                clearInterval()
                clearTimeout()
                return
            } else {
                cords.lat = response[0].lat;
                cords.lon = response[0].lon;
                cordsResults.city = response[0].name;
                cordsResults.state = response[0].state;
            }
        })
        .catch(err => {
            console.error(err)
        })
}

async function fetchWeatherCurrent() {
    await fetchCords();

    if (cordsResults.city === undefined || cordsResults.city === null) {
        return console.log('Invalid, cordsResults is undefined, unable to fetch current weather.')
    } else {
        storeCurrentCity();
        // Also appending it as a btn if it doesn't exist already
        if (!checkForCity(cordsResults.city, cordsResults.state)) {
            const CITY_BTN = {
                tag: 'button',
                setAttr: {
                    id: 'btn',
                    value: cordsResults.city,
                    'data-state': cordsResults.state
                },
                textContent: `${cordsResults.city}, ${cordsResults.state}`,
                appendTo: savedCities
            }
            appendContent(CITY_BTN)
        }
    }

    let apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cords.lat + '&lon=' + cords.lon + '&appid=' + apiKey2;

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Clearing current board AND days container
            clearBoard(statusContainer)

            const DATE = {
                tag: 'h1',
                setAttr: {
                    class: 'status-date',
                },
                textContent: `${cordsResults.city}, ${cordsResults.state} (${grabDate()})`,
                appendTo: statusContainer,
            }
            appendContent(DATE)

            // Appending reponse data to status container
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

            const UV_CON = {
                tag: 'div',
                setAttr: {
                    class: 'uv-container',
                },
                appendTo: statusContainer,
            }
            let uvContainer = appendContent(UV_CON)

            const UV_P = {
                tag: 'p',
                setAttr: {
                    class: 'uv-p',
                },
                textContent: 'UV Index:',
                appendTo: uvContainer,
            }
            appendContent(UV_P)

            const UV_INDEX = {
                tag: 'p',
                setAttr: {
                    class: 'uv-index',
                },
                textContent: response.current.uvi,
                appendTo: uvContainer,
            }
            appendContent(UV_INDEX)
            // uvIndexColor()
        })
        .catch(err => {
            console.error(err)
        })
}

async function fetchWeatherPast() {
    await fetchCords()
    loaderScreen()

    if (cordsResults.city === undefined || cordsResults.city === null) {
        // do error function here
        return console.log('Invalid, cordsResults is undefined, unable to fetch past weather.')
    }

    const YESTERDAY = grabUnix() - 86400;
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + YESTERDAY + '&appid=' + apiKey2

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Clearing current day
            clearBoard(forecastDayContainers[0])

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
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + DAYTWO + '&appid=' + apiKey2

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Clearing current day
            clearBoard(forecastDayContainers[1])

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
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + DAYTHREE + '&appid=' + apiKey2

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Clearing current day
            clearBoard(forecastDayContainers[2])

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
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + DAYFOUR + '&appid=' + apiKey2

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Clearing current day
            clearBoard(forecastDayContainers[3])

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
    apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + cords.lat + '&lon=' + cords.lon + '&dt=' + DAYFIVE + '&appid=' + apiKey2

    fetch(apiUrl)
        .then(response => {
            return response.json()
        })
        .then(response => {
            // Clearing current day
            clearBoard(forecastDayContainers[4])

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

// Clears container param
function clearBoard(container, exceptionSelector) {

    // Removes everything EXCEPT for a specified element with the selector in param
    if (exceptionSelector) {
        for (let i = 0; i < container.children.length; i++) {
            if (container.children[i].matches(exceptionSelector)) {
                continue
            } else {
                container.removeChild(container.children[i])
            }
        }
        container.removeChild(container.lastChild)

    // Otherwise we just remove everything
    } else {
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }
    }
}

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

function loaderScreen() {
    preLoader.removeAttribute('id')
    rightArticle.setAttribute('id', 'hidden')

    setTimeout(() => {
        preLoader.setAttribute('id', 'hidden')
        rightArticle.removeAttribute('id')
    }, 1000)
}

// Function that first pulls past cities and then stores current city in that array
function storeCurrentCity() {
    let locStorCities = JSON.parse(localStorage.getItem('locStorCities'))
    let locStorCity = cordsResults

    if (locStorCities === null || locStorCities === undefined) {
        console.log('No past cities stored.. Setting it empty and pushing current city')
        locStorCities = []

        locStorCities.push(locStorCity)
        localStorage.setItem('locStorCities', JSON.stringify(locStorCities))
    } else if (!checkStorage(locStorCities, locStorCity.city, locStorCity.state)) {
        locStorCities.push(locStorCity)
        localStorage.setItem('locStorCities', JSON.stringify(locStorCities))
    } else {
        return
    }
}

// .includes wasn't working for objects so...
// Returns true if city and state value is found in array
function checkStorage(array, city, state) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].city === city && array[i].state === state) {
            return true
        } else {
            return false
        }
    }
}

// Function that appends past cities in local storage upon loading
function appendPastCities() {
    let locStorCities = JSON.parse(localStorage.getItem('locStorCities'))

    if (locStorCities === null || locStorCities === undefined) {
        return console.log('No past cities to append :(, use me more')
    } else {
        // Looping through locStorCities array of objects and appending them
        for (let i = 0; i < locStorCities.length; i++) {
            let city = locStorCities[i].city
            let state = locStorCities[i].state

            if (checkForCity(city, state)) {
                // If the current city is already appended we skip current iteration
                continue;
            } else {
                // Otherwise, we just append it
                const CITY_BTN = {
                    tag: 'button',
                    setAttr: {
                        id: 'btn',
                        value: city,
                        'data-state': state
                    },
                    textContent: `${city}, ${state}`,
                    appendTo: savedCities
                }
                appendContent(CITY_BTN)
            }
        }
    }
}

// Returns true if the saved btn city already exists based on .value and dataset.state
function checkForCity(city, state) {
    let btns = document.querySelectorAll('#btn')

    if (btns === null || btns === undefined) {
        return console.log('No btns found')
    } else {
        // Looping through the elements btns and return true if it matches the city/state specified
        for (let i = 0; i < btns.length; i++) {
            if (btns[i].value === city && btns[i].dataset.state === state) {
                return true
            }
        }
        return false
    }
}

// Handles All Button Elements in container Saved Cities
savedCities.addEventListener('click', targ => {
    // If the clicked element also has the id btn
    if (targ.target && targ.target.matches('#btn')) {
        let city = targ.target.value
        let state = targ.target.dataset.state

        // Storing city data in inputContainer object
        inputContainer.city = city;
        inputContainer.state = state;

        // Fetching weather
        fetchWeatherCurrent();
        fetchWeatherPast();

        // If the clicked element also has the id clear-btn
    } else if (targ.target && targ.target.matches('#clear-btn')) {
        clearBoard(savedCities, '#clear-btn')
        localStorage.removeItem('locStorCities')
    }
})

// Handles form submission
let formSubmitHandler = function (event) {
    event.preventDefault();

    let city = searchCity.value.trim();
    let state = searchState.value.trim();

    // Storing city data in inputContainer object
    inputContainer.city = city;

    if (state === '') {
        fetchWeatherCurrent();
        fetchWeatherPast();
    } else {
        inputContainer.state = state;
        fetchWeatherCurrent();
        fetchWeatherPast();
    }
}

userInput.addEventListener('submit', formSubmitHandler);