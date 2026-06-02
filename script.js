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
const electricDisturbance = document.querySelector("#electric-disturbance");
const riddlerFlash = document.querySelector("#riddler-flash");
const hintBlackout = document.querySelector("#hint-blackout");
const caveEntrance = document.querySelector(".cave-entrance");
const caveWarning = document.querySelector("#cave-warning");
const caveTerminal = document.querySelector("#cave-terminal");
const warningReadable = document.querySelector("#warning-readable");
const warningLineOne = document.querySelector("#warning-line-one");
const warningLineTwo = document.querySelector("#warning-line-two");
const terminalInput = document.querySelector("#terminal-input");
const terminalLabel = document.querySelector("#terminal-label");
const terminalPrompt = document.querySelector("#terminal-prompt");
const terminalStatus = document.querySelector("#terminal-status");
const passwordHint = document.querySelector("#password-hint");
const accessMessage = document.querySelector("#access-message");
const transmissionButton = document.querySelector("#transmission-button");
let blackoutTimer;
let caveTimer;
let flashlightX = -200;
let flashlightY = -200;
let pointerX = -200;
let pointerY = -200;
let isWarningTyping = false;
let isHintRevealing = false;
let terminalMode = "confirmation";
let hasRevealedHint = false;

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
  hintBlackout.style.setProperty("--flashlight-x", `${flashlightX}px`);
  hintBlackout.style.setProperty("--flashlight-y", `${flashlightY}px`);
  window.requestAnimationFrame(animateFlashlight);
}

animateFlashlight();

function revealCaveWarning() {
  if (isWarningTyping || !caveTerminal.hidden) {
    return;
  }

  document.body.classList.add("is-warning-visible");
  caveWarning.removeAttribute("aria-hidden");
  isWarningTyping = true;

  const lines = [
    [warningLineOne, "ARE YOU SURE YOU ARE READY"],
    [warningLineTwo, "TO ENTER THE HOME OF THE BAT?"],
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showTerminal() {
    caveTerminal.hidden = false;
    isWarningTyping = false;
    terminalInput.focus();
  }

  if (reducedMotion) {
    lines.forEach(([element, text]) => {
      element.textContent = text;
    });
    showTerminal();
    return;
  }

  let lineIndex = 0;
  let characterIndex = 0;

  function typeNextCharacter() {
    const [element, text] = lines[lineIndex];
    element.textContent = text.slice(0, characterIndex + 1);
    characterIndex += 1;

    if (characterIndex < text.length) {
      window.setTimeout(typeNextCharacter, 72);
      return;
    }

    lineIndex += 1;
    characterIndex = 0;

    if (lineIndex < lines.length) {
      window.setTimeout(typeNextCharacter, 600);
      return;
    }

    window.setTimeout(showTerminal, 650);
  }

  typeNextCharacter();
}

caveEntrance.addEventListener("click", revealCaveWarning);

function revealPasswordHint() {
  const lines = [
    "A HERO MAY HIDE HIS FACE,",
    "BUT NEVER HIS NAME.",
    "SEARCH NOT IN VAIN.",
  ];
  const revealSteps = [
    ["A", 650],
    ["HERO", 850],
    ["MAY", 620],
    ["HIDE", 760],
    ["HIS", 620],
    ["FACE,", 1250],
    ["BUT", 720],
    ["NEVER", 900],
    ["HIS", 700],
    ["N@M#", 620],
    ["NAME.", 1400],
    ["SEARCH", 900],
    ["NOT", 720],
    ["IN", 1800],
    ["VAIN.", 1600],
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stepIndex = 0;

  isHintRevealing = true;
  terminalMode = "revealing-hint";
  terminalInput.value = "";
  terminalInput.placeholder = "";
  terminalInput.disabled = true;
  caveTerminal.hidden = true;
  terminalStatus.hidden = true;
  passwordHint.hidden = false;
  passwordHint.textContent = "DECRYPTING...";

  function finishReveal() {
    isHintRevealing = false;
    hasRevealedHint = true;
    terminalMode = "password";
    terminalInput.type = "password";
    terminalInput.autocomplete = "current-password";
    terminalInput.disabled = false;
    caveTerminal.hidden = false;
    terminalLabel.textContent = "Enter password";
    terminalPrompt.textContent = "PASSWORD >";
    passwordHint.textContent = lines.join("\n");
    document.body.classList.add("is-hint-illuminated");
    terminalInput.focus();
  }

  if (reducedMotion) {
    finishReveal();
    return;
  }

  function revealNextStep() {
    const [text, delay] = revealSteps[stepIndex];
    passwordHint.textContent = text;
    stepIndex += 1;

    if (stepIndex < revealSteps.length) {
      window.setTimeout(revealNextStep, delay);
      return;
    }

    window.setTimeout(finishReveal, delay);
  }

  function startReveal() {
    window.setTimeout(revealNextStep, 900);
  }

  function scheduleRiddlerGlimpse(pose, delay, duration) {
    window.setTimeout(() => {
      riddlerFlash.className = `riddler-flash riddler-flash--${pose} is-visible`;
      window.setTimeout(() => {
        riddlerFlash.className = "riddler-flash";
      }, duration);
    }, delay);
  }

  window.setTimeout(() => {
    electricDisturbance.classList.add("is-active");
    scheduleRiddlerGlimpse("upper-left", 286, 154);
    scheduleRiddlerGlimpse("lower-right", 616, 242);
    scheduleRiddlerGlimpse("large", 1034, 242);
    scheduleRiddlerGlimpse("center", 1474, 330);
    window.setTimeout(() => {
      electricDisturbance.classList.remove("is-active");
      window.setTimeout(startReveal, 180);
    }, 2200);
  }, 1800);
}

function rejectPassword() {
  const statusLines = ["ACCESS DENIED", "DECRYPTING...", "CLUE AVAILABLE", "TYPE HINT TO DECRYPT"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lineIndex = 0;

  terminalMode = "denied";
  terminalInput.value = "";
  terminalInput.placeholder = "";
  terminalInput.disabled = true;
  caveTerminal.hidden = true;
  passwordHint.hidden = true;
  terminalStatus.textContent = "";
  terminalStatus.hidden = false;
  document.body.classList.add("is-password-denied");

  function offerHintCommand() {
    terminalMode = "hint-command";
    terminalInput.type = "text";
    terminalInput.autocomplete = "off";
    terminalInput.disabled = false;
    caveTerminal.hidden = false;
    terminalLabel.textContent = "Type hint to decrypt the clue";
    terminalPrompt.textContent = "COMMAND >";
    terminalInput.focus();
  }

  if (reducedMotion) {
    terminalStatus.textContent = statusLines.join("\n");
    offerHintCommand();
    return;
  }

  function showNextStatusLine() {
    terminalStatus.textContent = statusLines.slice(0, lineIndex + 1).join("\n");
    lineIndex += 1;

    if (lineIndex < statusLines.length) {
      window.setTimeout(showNextStatusLine, 950);
      return;
    }

    window.setTimeout(offerHintCommand, 750);
  }

  window.setTimeout(showNextStatusLine, 900);
}

caveTerminal.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isHintRevealing) {
    return;
  }

  const value = terminalInput.value.trim().toLowerCase();

  if (terminalMode === "hint-command") {
    if (value === "hint") {
      revealPasswordHint();
      return;
    }

    terminalInput.value = "";
    terminalInput.placeholder = "TYPE HINT";
    terminalInput.focus();
    return;
  }

  if (terminalMode === "password" && value !== "wayne") {
    if (hasRevealedHint) {
      terminalInput.value = "";
      terminalInput.placeholder = "ACCESS DENIED";
      terminalInput.focus();
      return;
    }

    rejectPassword();
    return;
  }

  if (terminalMode === "password") {
    terminalInput.value = "";
    terminalInput.placeholder = "";
    terminalInput.disabled = true;
    caveTerminal.hidden = true;
    terminalStatus.hidden = true;
    passwordHint.hidden = true;
    document.body.classList.remove("is-hint-illuminated");
    accessMessage.hidden = false;
    transmissionButton.hidden = false;
    return;
  }

  if (value !== "yes") {
    terminalInput.value = "";
    terminalInput.placeholder = "TYPE YES";
    terminalInput.focus();
    return;
  }

  terminalInput.value = "";
  terminalInput.placeholder = "";
  terminalInput.type = "password";
  terminalInput.autocomplete = "current-password";
  terminalMode = "password";
  terminalLabel.textContent = "Enter password";
  terminalPrompt.textContent = "PASSWORD >";
  warningReadable.hidden = true;
  warningLineOne.hidden = true;
  warningLineTwo.hidden = true;
  terminalInput.focus();
});

transmissionButton.addEventListener("click", () => {
  window.open("https://www.youtube.com/watch?v=QDia3e12czc", "_blank", "noopener,noreferrer");
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
