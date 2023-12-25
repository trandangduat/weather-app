import "./style.css";

const commandForm = document.querySelector("form");
const commandLine = document.querySelector(".line.command");
const terminal = document.querySelector("#terminal");

commandForm.addEventListener("submit", processCommand);

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
    terminal.insertBefore(line, commandLine); 
}


async function processCommand (event) {
    event.preventDefault();
    let command = event.target.querySelector("input").value;
    newLine(command, "", 1);
    commandForm.reset();

    command = command.split(" ");
    if (command[0] == "!w") {
        command.splice(0, 1); 
        command.join(" "); 
        await weatherCommand(command);
    } 
    else if (command[0] == "!cls") {
        clearCommand();
    } 
    else {
        newLine("'" + command[0] + "'" + " is not a valid command.", "[ERROR]", 0, "error");
    }
    
    // Auto scroll to the form 
    window.scrollTo({
        top: commandForm.offsetTop,
        behavior: "smooth",
    }); 
}

function clearCommand() {
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
