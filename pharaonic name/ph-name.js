// ============ HIEROGLYPH TRANSLATOR ============
const HIERO_MAP = {
  a:"𓄿", b:"𓃀", c:"𓍿", d:"𓂧", e:"𓇋", f:"𓆑",
  g:"𓎼", h:"𓉔", i:"𓇋", j:"𓆓", k:"𓎡", l:"𓃭",
  m:"𓅓", n:"𓈖", o:"𓍯", p:"𓊪", q:"𓈎", r:"𓂋",
  s:"𓋴", t:"𓏏", u:"𓅱", v:"𓆑", w:"𓅱", x:"𓐍",
  y:"𓇌", z:"𓊃"
};

const ANIM_DELAY = 120;
const CIRCLE_RADIUS = 85;

// DOM refs
const input       = document.querySelector(".input-card input");
const output      = document.querySelector(".hiero-text");
const btn         = document.getElementById("translateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const boxes       = document.querySelectorAll(".style-box");

// State
let currentStyle   = "horizontal";
let currentSymbols = [];
let animationId    = null;
let isAnimating    = false;

// ---- Helpers ----
function translate(name) {
  return [...name.toLowerCase()]
    .map(ch => HIERO_MAP[ch])
    .filter(Boolean);
}

// Silent sound — never breaks the app
function playTick() {
  // Sound disabled for reliability. Re-enable by dropping a local click.mp3
  // in the folder and uncommenting below:
  //
  // try {
  //   const s = new Audio("click.mp3");
  //   s.volume = 0.5;
  //   s.play().catch(() => {});
  // } catch (e) {}
}

function updateDownloadButton() {
  downloadBtn.disabled = isAnimating || currentSymbols.length === 0;
}

function setAnimating(state) {
  isAnimating = state;
  updateDownloadButton();
}

function cancelAnimation() {
  if (animationId) {
    clearInterval(animationId);
    clearTimeout(animationId);
    animationId = null;
  }
  isAnimating = false;
  updateDownloadButton();
}

// ---- Render ----
function render() {
  cancelAnimation();
  output.className = "hiero-text";
  output.textContent = "";
  updateDownloadButton();

  if (currentSymbols.length === 0) return;

  if (currentStyle === "circle") {
    drawCircle(currentSymbols);
  } else {
    if (currentStyle === "vertical") output.classList.add("vertical");
    typeEffect(currentSymbols, currentStyle === "vertical");
  }
}

function typeEffect(symbols, isVertical = false) {
  setAnimating(true);
  let i = 0;

  animationId = setInterval(() => {
    if (i >= symbols.length) {
      cancelAnimation();
      return;
    }
    const node = document.createElement("span");
    node.textContent = symbols[i] + (isVertical ? "" : " ");
    output.appendChild(node);
    playTick();
    i++;
  }, ANIM_DELAY);
}

function drawCircle(symbols) {
  setAnimating(true);
  output.classList.add("circle");
  const angleStep = 360 / symbols.length;
  const frag = document.createDocumentFragment();

  symbols.forEach((s, i) => {
    const span = document.createElement("span");
    span.textContent = s;
    const rot = i * angleStep;
    span.style.transform = `rotate(${rot}deg) translate(${CIRCLE_RADIUS}px) rotate(-${rot}deg)`;
    span.style.opacity = "0";
    span.style.transition = "opacity 0.5s";
    frag.appendChild(span);
  });

  output.appendChild(frag);

  const spans = output.querySelectorAll("span");
  spans.forEach((span, i) => {
    setTimeout(() => {
      span.style.opacity = "1";
      playTick();
      if (i === spans.length - 1) {
        setTimeout(() => setAnimating(false), 500);
      }
    }, i * ANIM_DELAY);
  });
}

// ---- Download as image ----
async function downloadAsImage() {
  if (currentSymbols.length === 0 || isAnimating) return;

  if (typeof html2canvas === "undefined") {
    alert(window.I18n ? window.I18n.t('phName.errorLibrary') : "Image library failed to load. Check your internet connection.");
    return;
  }

  downloadBtn.disabled = true;
  const originalText = downloadBtn.textContent;
  downloadBtn.textContent = window.I18n ? window.I18n.t('phName.generating') : "Generating...";

  try {
    // Target the whole output card so the title and border are included
    const target = document.querySelector(".output-card");

    const canvas = await html2canvas(target, {
      backgroundColor: "#111",
      scale: 2,
      useCORS: true,
      logging: false
    });

    const link = document.createElement("a");
    link.download = `hieroglyphs-${input.value || "name"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Download failed:", err);
    alert(window.I18n ? window.I18n.t('phName.errorGeneral') : "Something went wrong while generating the image.");
  } finally {
    downloadBtn.textContent = originalText;
    updateDownloadButton();
  }
}

// ---- Events ----
btn.addEventListener("click", () => {
  currentSymbols = translate(input.value);
  render();
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") btn.click();
});

boxes.forEach(box => {
  box.addEventListener("click", () => {
    boxes.forEach(b => b.classList.remove("active"));
    box.classList.add("active");
    currentStyle = box.dataset.style;
    render();
  });
});

downloadBtn.addEventListener("click", downloadAsImage);