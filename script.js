const digitRows = {
  "0": [" #### ", "##  ##", "##  ##", "##  ##", "##  ##", "##  ##", " #### "],
  "1": ["  ##  ", " ###  ", "  ##  ", "  ##  ", "  ##  ", "  ##  ", "######"],
  "2": [" #### ", "##  ##", "    ##", "  ### ", " ##   ", "##    ", "######"],
  "3": ["##### ", "    ##", "    ##", " #### ", "    ##", "    ##", "##### "],
  "4": ["##  ##", "##  ##", "##  ##", "######", "    ##", "    ##", "    ##"],
  "5": ["######", "##    ", "##    ", "##### ", "    ##", "    ##", "##### "],
  "6": [" #### ", "##    ", "##    ", "##### ", "##  ##", "##  ##", " #### "],
  "7": ["######", "    ##", "   ## ", "  ##  ", " ##   ", " ##   ", " ##   "],
  "8": [" #### ", "##  ##", "##  ##", " #### ", "##  ##", "##  ##", " #### "],
  "9": [" #### ", "##  ##", "##  ##", " #####", "    ##", "    ##", " #### "],
  ":": ["      ", "  ##  ", "  ##  ", "      ", "  ##  ", "  ##  ", "      "],
};

const display = document.querySelector("#clock-display");
const readable = document.querySelector("#clock-readable");
const stormCloud = document.querySelector("#storm-cloud");
const batmanMark = document.querySelector("#batman-mark");
const blackout = document.querySelector(".blackout");
const caveEntrance = document.querySelector(".cave-entrance");
const caveWarning = document.querySelector("#cave-warning");
const caveTerminal = document.querySelector("#cave-terminal");
const terminalInput = document.querySelector("#terminal-input");
const terminalLabel = document.querySelector("#terminal-label");
const terminalPrompt = document.querySelector("#terminal-prompt");
let blackoutTimer;
let caveTimer;
let flashlightX = -200;
let flashlightY = -200;
let pointerX = -200;
let pointerY = -200;

function moveFlashlight(event) {
  pointerX = event.clientX;
  pointerY = event.clientY;
}

window.addEventListener("pointermove", moveFlashlight);

function animateFlashlight() {
  flashlightX += (pointerX - flashlightX) * 0.075;
  flashlightY += (pointerY - flashlightY) * 0.075;
  blackout.style.setProperty("--flashlight-x", `${flashlightX}px`);
  blackout.style.setProperty("--flashlight-y", `${flashlightY}px`);
  window.requestAnimationFrame(animateFlashlight);
}

animateFlashlight();

function revealCaveWarning() {
  document.body.classList.add("is-warning-visible");
  caveWarning.removeAttribute("aria-hidden");
  window.setTimeout(() => terminalInput.focus(), 0);
}

caveEntrance.addEventListener("click", revealCaveWarning);

caveTerminal.addEventListener("submit", (event) => {
  event.preventDefault();

  if (terminalInput.type === "password") {
    return;
  }

  if (terminalInput.value.trim().toLowerCase() !== "yes") {
    terminalInput.value = "";
    terminalInput.placeholder = "TYPE YES";
    terminalInput.focus();
    return;
  }

  terminalInput.value = "";
  terminalInput.placeholder = "";
  terminalInput.type = "password";
  terminalInput.autocomplete = "current-password";
  terminalLabel.textContent = "Enter password";
  terminalPrompt.textContent = "PASSWORD >";
  terminalInput.focus();
});

function revealBatman() {
  document.body.classList.add("is-revealed");
  batmanMark.classList.add("is-revealed");
  batmanMark.removeAttribute("aria-hidden");
  stormCloud.setAttribute("aria-expanded", "true");
  window.clearTimeout(blackoutTimer);
  window.clearTimeout(caveTimer);
  blackoutTimer = window.setTimeout(() => {
    document.body.classList.add("is-blackout");
    caveTimer = window.setTimeout(() => {
      document.body.classList.add("is-cave-visible");
    }, 4000);
  }, 3000);
}

stormCloud.addEventListener("click", revealBatman);
stormCloud.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    revealBatman();
  }
});

function renderClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  display.textContent = Array.from({ length: 7 }, (_, row) =>
    [...time].map((character) => digitRows[character][row]).join("  ")
  ).join("\n");

  readable.textContent = `Current India Standard Time: ${time}`;
  window.setTimeout(renderClock, 1000 - now.getMilliseconds());
}

renderClock();
