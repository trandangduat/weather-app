import "./style.css";
import {processCommand} from "./process_command.js"
import {customizeTerminal} from "./customize_terminal.js"

const commandLine = document.querySelector(".line.command");
const terminal = document.querySelector("#terminal");
const commandForm = document.querySelector("form");

customizeTerminal();
commandForm.addEventListener("submit", processCommand);
