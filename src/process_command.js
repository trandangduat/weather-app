import {newLine} from './new_line.js'

const commandForm = document.querySelector("form");
const commandLine = document.querySelector(".line.command");
const terminal = document.querySelector("#terminal");

async function processCommand (event) {
    event.preventDefault();
    let command = event.target.querySelector("input").value;
    if (!command) {
        return;
    } 
    newLine(command, "", 1);
    commandForm.reset();

    command = command.split(" ");
    if (command[0] == "!w") {
        command.splice(0, 1); 
        command.join(" "); 
        await weatherCommand(command);
    } 
    else if (command[0] == "!bg") {
        backgroundChange(command[1]); 
    }
    else if (command[0] == "!cls") {
        clearAllCommands();
    } 
    else {
        newLine(`'${command[0]}' is not a valid command.`, "[ERROR]", 0, "error");
    }
    
    // Auto scroll to the form 
    window.scrollTo({
        top: commandForm.offsetTop,
        behavior: "smooth",
    }); 
}

function backgroundChange (URL) {
    terminal.style.backgroundImage = `url(${URL})`; 
}

function clearAllCommands() {
    // Except the overlay, ascii banner and the form, every line will be deleted
    while (terminal.children.length > 3) {
        terminal.removeChild(terminal.querySelectorAll(".line")[1]);
    }
}

async function weatherCommand (cityName) { 
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
        // Name, temperature, current time, conditionl
        newLine(response.location.name, "name");
        newLine(response.current.temp_c + "°C", "temp");
        newLine(response.location.localtime.split(" ")[1], "time"); 
        newLine(response.current.condition.text, "cond");
        newLine("", "forecast");
        
        // Forecast as table with time/temperature 
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
                forecastTable += "<td>temp(°C)</td>"     
                response.forecast.forecastday[0].hour.forEach((hour) => {
                    const temp_c = hour.temp_c;
                    const temp_f = hour.temp_f;
                    if (hour.time_epoch >= response.location.localtime_epoch) {
                        forecastTable += `<td>${temp_c}°</td>`;    
                    }
                }); 
            forecastTable += "</tr>";
        forecastTable += "</table>";
        newLine(forecastTable, "");
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

export {processCommand};