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
const warningReadable = document.querySelector("#warning-readable");
const warningLineOne = document.querySelector("#warning-line-one");
const warningLineTwo = document.querySelector("#warning-line-two");
const terminalInput = document.querySelector("#terminal-input");
const terminalLabel = document.querySelector("#terminal-label");
const terminalPrompt = document.querySelector("#terminal-prompt");
const terminalStatus = document.querySelector("#terminal-status");
const passwordHint = document.querySelector("#password-hint");
const accessMessage = document.querySelector("#access-message");
let blackoutTimer;
let caveTimer;
let flashlightX = -200;
let flashlightY = -200;
let pointerX = -200;
let pointerY = -200;
let isWarningTyping = false;
let isHintRevealing = false;

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
      window.setTimeout(typeNextCharacter, 42);
      return;
    }

    lineIndex += 1;
    characterIndex = 0;

    if (lineIndex < lines.length) {
      window.setTimeout(typeNextCharacter, 320);
      return;
    }

    window.setTimeout(showTerminal, 420);
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
  const encryptedLines = [
    "A H#RO M@Y HIDE HIS F@CE,",
    "BUT N#VER HIS N@ME.",
    "SE@RCH NOT IN V@IN.",
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lineIndex = 0;

  isHintRevealing = true;
  terminalInput.value = "";
  terminalInput.placeholder = "";
  terminalInput.disabled = true;
  terminalPrompt.textContent = "DECRYPTING...";
  terminalStatus.hidden = true;
  passwordHint.hidden = false;
  passwordHint.textContent = "DECRYPTING...";

  function finishReveal() {
    isHintRevealing = false;
    terminalInput.disabled = false;
    terminalPrompt.textContent = "PASSWORD >";
    passwordHint.textContent = `HINT:\n${lines.join("\n")}`;
    terminalInput.focus();
  }

  if (reducedMotion) {
    finishReveal();
    return;
  }

  function revealNextLine() {
    const revealedLines = lines.slice(0, lineIndex);
    passwordHint.textContent = `DECRYPTING...\n${[...revealedLines, encryptedLines[lineIndex]].join("\n")}`;

    window.setTimeout(() => {
      passwordHint.textContent = `DECRYPTING...\n${lines.slice(0, lineIndex + 1).join("\n")}`;
      lineIndex += 1;

      if (lineIndex < lines.length) {
        window.setTimeout(revealNextLine, 360);
        return;
      }

      window.setTimeout(finishReveal, 420);
    }, 240);
  }

  window.setTimeout(revealNextLine, 420);
}

caveTerminal.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isHintRevealing) {
    return;
  }

  if (terminalInput.type === "password" && terminalInput.value.trim().toLowerCase() === "hint") {
    revealPasswordHint();
    return;
  }

  if (terminalInput.type === "password" && terminalInput.value.trim().toLowerCase() !== "wayne") {
    terminalInput.value = "";
    terminalInput.placeholder = "ACCESS DENIED";
    terminalStatus.textContent = "ACCESS DENIED\nANALYZING ATTEMPT...\nCLUE AVAILABLE\nTYPE HINT TO DECRYPT";
    terminalStatus.hidden = false;
    terminalInput.focus();
    return;
  }

  if (terminalInput.type === "password") {
    terminalInput.value = "";
    terminalInput.placeholder = "";
    terminalInput.disabled = true;
    terminalPrompt.textContent = "ACCESS GRANTED";
    terminalStatus.hidden = true;
    passwordHint.hidden = true;
    accessMessage.hidden = false;
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
  warningReadable.hidden = true;
  warningLineOne.hidden = true;
  warningLineTwo.hidden = true;
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
