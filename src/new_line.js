const terminal = document.querySelector("#terminal");
const commandLine = document.querySelector(".line.command");

function newLine (contents, prefix = "", isCommand = 0, prefixType = "") {
    const line = document.createElement("div");
    line.setAttribute("class", "line" + (isCommand ? " command" : ""));
    if (prefix) { 
        line.innerHTML = `<strong class = ${prefixType}>*${prefix}: </strong>`;
    }
    line.innerHTML += contents;
    terminal.insertBefore(line, commandLine); 
}

export {newLine};

