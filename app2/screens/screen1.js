import { navigateTo, socket } from "../app.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
      <div id="screen1">
        <h2>Screen 1</h2>
        <p>Hello from screen 1</p>
      </div>
      `;

  socket.on("next-screen", (data) => {
    navigateTo("/screen2", { name: "Hola" });
  });
}
