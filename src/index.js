import "./style.css";

const cityForm = document.querySelector("form");
const commandLine = document.querySelector(".line.command");
const loadingStages = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]; 

cityForm.addEventListener("submit", process);

function newLine (contents, prefix = "", isCommand = 0, prefixType = "instruct") {
    const line = document.createElement("div");
    line.setAttribute("class", "line");
    if (isCommand) {
        line.classList.add("command");
    }
    if (prefix) { 
        line.innerHTML = `<strong class = ${prefixType}>${prefix}</strong>`;
    }
    line.innerHTML += contents;
    document.body.insertBefore(line, commandLine); 
}

async function process (event) {
    event.preventDefault();
    const cityName = event.target.querySelector("input").value;
    newLine(cityName, "", 1);
    cityForm.reset();

    // Appending the loading symbol next to the command form when starting fetching
    const loadingSymbol = document.createElement("div");
    loadingSymbol.setAttribute("class", "line warning");
    document.body.insertBefore(loadingSymbol, commandLine);

    let currentLoadingStage = 0;
    let loadingInterval = setInterval(() => {
        loadingSymbol.textContent = loadingStages[(++currentLoadingStage) % loadingStages.length]
    }, 100);

    // Fetching ...
    const response = await fetchWeather(cityName);
    
    // Remove the loading effect when done fetching 
    clearInterval(loadingInterval);
    loadingSymbol.remove();

    // Adding result as separate lines 
    
    if (response.location) {
        newLine(response.location.name, "name");
        newLine(response.current.temp_c, "temp");
        newLine("", "forecast");
        response.forecast.forecastday[0].hour.forEach((hour) => {
            const time = hour.time.split(" ")[1];
            const temp = hour.temp_c;
            if (hour.time_epoch >= response.location.localtime_epoch) {
                newLine(temp, time, 0, "note")
            }
        });  
        
    } else {
        newLine(response, "[ERROR]", 0, "error");
    }
    
}

async function fetchWeather(CITY_NAME) {
    const URL = `https://api.weatherapi.com/v1/forecast.json?key=8a7850118cab40ffa86151016232312&q=${CITY_NAME}&days=1&aqi=no&alerts=no`;
    const response = await fetch(URL, {mode: "cors"})
                            .then((res) => { 
                                if (res.ok) return res.json();
                                else return res.status;
                            })
    return response;
    
}
