import "./style.css";

const cityForm = document.querySelector("form");
const commandLine = document.querySelector(".line.command");
const loadingStages = ["|", "/", "-", "\\"];

cityForm.addEventListener("submit", process);

function newLine (contents, prefix = "", isCommand = 0) {
    const line = document.createElement("div");
    line.setAttribute("class", "line");
    if (isCommand) {
        line.classList.add("command");
    }
    line.innerHTML = `<strong class = "instruct">${prefix}</strong> ${contents}`;
    return line;
}

async function process (event) {
    event.preventDefault();
    const cityName = event.target.querySelector("input").value;

    // Appending the loading symbol next to the command form when starting fetching
    const loadingSymbol = document.createElement("span");
    commandLine.appendChild(loadingSymbol);
    let currentLoadingStage = 0;
    let loadingInterval = setInterval(() => {
        loadingSymbol.textContent = loadingStages[(++currentLoadingStage) % loadingStages.length]
    }, 100);

    // Fetching ...
    const response = await fetchWeather(cityName);
    
    // Remove the loading effect when done fetching 
    clearInterval(loadingInterval);
    loadingSymbol.textContent = ""; 

    // Adding result as separate lines 
    document.body.insertBefore(newLine(cityName, "", 1), commandLine);
    
    if (response.location) {
        document.body.insertBefore(newLine(response.location.name, "name"), commandLine);
        document.body.insertBefore(newLine(response.current.temp_c, "temp"), commandLine);
    } else {
        document.body.insertBefore(newLine(response, "[ERROR]"), commandLine);
    }
    

    cityForm.reset();
}

async function fetchWeather(CITY_NAME) {
    const URL = `https://api.weatherapi.com/v1/current.json?key=8a7850118cab40ffa86151016232312&q=${CITY_NAME}&aqi=no`;
    const response = await fetch(URL, {mode: "cors"})
                            .then((res) => { 
                                if (res.ok) return res.json();
                                else return res.status;
                            })
    return response;
    
}
