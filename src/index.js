import "./style.css";

const cityForm = document.querySelector("form");
const commandLine = document.querySelector(".line.command");

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
    const loadingStages = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]; 
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
        newLine(response.current.temp_c + "°C", "temp");
        newLine("", "forecast");
        let forecastTable = "";
        forecastTable += "<table>"; 
            forecastTable += "<tr>"; 
                forecastTable += "<th>time</th>"     
                response.forecast.forecastday[0].hour.forEach((hour) => {
                    const time = hour.time.split(" ")[1];
                    if (hour.time_epoch >= response.location.localtime_epoch) {
                        forecastTable += `<th>${time}</th>`;
                    }
                }); 
            forecastTable += "</tr>";
            forecastTable += "<tr>";
                forecastTable += "<td>temp</td>"     
                response.forecast.forecastday[0].hour.forEach((hour) => {
                    const temp_c = hour.temp_c;
                    const temp_f = hour.temp_f;
                    if (hour.time_epoch >= response.location.localtime_epoch) {
                        forecastTable += `<td>${temp_c}°C</td>`;    
                    }
                }); 
            forecastTable += "</tr>";
        forecastTable += "</table>";
        newLine(forecastTable, "");
        
    } else {
        newLine(response, "[ERROR]", 0, "error");
    }
    
    // Auto scroll to the form 
    window.scrollTo(0, cityForm.offsetTop); 
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
