import { grammar, createSemantics, parse } from "language";

let inputValue = "";
let result = "";

const resultSpan = document.querySelector("#result")!;

function handleInputChange(event: any) {
  inputValue = event.target.value;
  try {
    // TODO: real var map based on input
    result = parse(
      grammar,
      createSemantics(grammar, { a: true, b: true }),
      inputValue
    );
    resultSpan.textContent = result;
    console.log(result);
  } catch (error: any) {
    result = `Error: ${error.message}`;
  }
}

document
  .getElementById("propositionInput")!
  .addEventListener("input", handleInputChange);
