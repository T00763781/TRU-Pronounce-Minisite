// Minimal JS: inject tool URL and provide carousel controls (no frameworks)
const TOOL_URL_DEFAULT = "https://YOUR-ORG.github.io/TRU-Name-Pronouncer/embed.html";

function $(id){ return document.getElementById(id); }

function initToolEmbed(){
  const iframe = $("toolFrame");
  if (!iframe) return;
  const url = document.documentElement.getAttribute("data-tool-url") || TOOL_URL_DEFAULT;
  iframe.src = url;
  const links = document.querySelectorAll("[data-tool-link]");
  links.forEach(a => a.setAttribute("href", url.replace(/\/embed\.html$/,"/")));
}

function initCarousel(){
  const el = $("carousel");
  if (!el) return;
  const prev = $("prevBtn");
  const next = $("nextBtn");

  function scrollByCard(dir){
    const card = el.querySelector(".slide");
    const w = card ? card.getBoundingClientRect().width : 360;
    el.scrollBy({ left: dir * (w + 12), behavior: "smooth" });
  }

  prev?.addEventListener("click", () => scrollByCard(-1));
  next?.addEventListener("click", () => scrollByCard(1));

  // Enable/disable buttons based on scroll position
  function update(){
    const max = el.scrollWidth - el.clientWidth - 1;
    if (prev) prev.disabled = el.scrollLeft <= 2;
    if (next) next.disabled = el.scrollLeft >= max;
  }
  el.addEventListener("scroll", () => window.requestAnimationFrame(update));
  update();
}

initToolEmbed();
initCarousel();
