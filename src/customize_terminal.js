const colors = ["#0A0E14", "#FF3333", "#C2D94C", "#FF8F40", "#59C2FF", "#FFEE99", "#95E6CB", "#B3B1AD"];

const colorTable = document.querySelector("#colorscheme-table");

function customizeTerminal() {
    colors.forEach((color) => {
        const colorCell = document.createElement("div");
        colorCell.setAttribute("class", "color-cell");
        colorCell.style.backgroundColor = color;
        colorTable.appendChild(colorCell);    
    });
}

export {customizeTerminal};