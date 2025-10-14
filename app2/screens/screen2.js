import { navigateTo } from "../app.js";

export default function renderScreen1(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
        <div id="screen2">
            <h2>Screen 2</h2>
            <p>Hello from screen 2</p>
            <button id="go-screen-back">Go to previous screen</button>
        </div>
        `;

  const goBackButton = document.getElementById("go-screen-back");

  goBackButton.addEventListener("click", () => {
    navigateTo("/");
  });
}
