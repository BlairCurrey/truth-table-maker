import { makeTruthTable } from "language";

const resultDiv = document.querySelector("#result")!;
let inputValue = "";

function createHtmlTable(truthTable: (string[] | boolean[])[]) {
  const tableWrapper = document.createElement("div");
  tableWrapper.id = "table-wrapper";
  const table = document.createElement("table");
  tableWrapper.appendChild(table);

  // Create header row
  const headerRow = document.createElement("tr");
  truthTable[0].forEach((cell) => {
    const th = document.createElement("th");
    th.textContent = cell.toString();
    th.classList.add("header-cell");
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Iterate over remaining non-header rows
  for (let i = 1; i < truthTable.length; i++) {
    const row = truthTable[i];
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell ? "T" : "F";
      tr.appendChild(td);
    });
    table.appendChild(tr);
  }

  return tableWrapper;
}

function handleInputChange(event: any) {
  inputValue = event.target.value;
  try {
    const truthTable = makeTruthTable(inputValue);
    const htmlTable = createHtmlTable(truthTable);
    resultDiv.innerHTML = "";
    resultDiv.appendChild(htmlTable);
  } catch (error: any) {
    resultDiv.textContent = `Error: ${error.message}`;
  }
}

const propositionInput = document.getElementById("propositionInput")!;
propositionInput.addEventListener("input", handleInputChange);

window.onload = function () {
  propositionInput.focus();
};
