// TRU minisite JS (no frameworks)
// - inject tool URL
// - carousel controls
// - load content.md and inject text blocks into the page

const TOOL_URL_DEFAULT = "https://YOUR-ORG.github.io/TRU-Name-Pronouncer/embed.html";
const CONTENT_MD_DEFAULT = "content.md";

function $(id){ return document.getElementById(id); }

function escapeHtml(s){
  return (s ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

// A small, safe markdown renderer (subset) for our content.md.
// - Escapes HTML first (so content can't inject scripts)
// - Supports headings, paragraphs, bold, italics, inline code, ul/ol, hr
function renderMarkdownLite(md){
  const src = escapeHtml(md).replace(/\r\n/g, "\n");
  const lines = src.split("\n");

  let out = [];
  let para = [];
  let inUl = false;
  let inOl = false;

  function flushPara(){
    if (!para.length) return;
    const text = para.join(" ").trim();
    if (text) out.push(`<p>${inline(text)}</p>`);
    para = [];
  }
  function closeLists(){
    if (inUl){ out.push("</ul>"); inUl = false; }
    if (inOl){ out.push("</ol>"); inOl = false; }
  }

  function inline(s){
    // inline code
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    // bold
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // italics (simple)
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return s;
  }

  for (let raw of lines){
    const line = raw.trimEnd();

    // block separators
    if (/^---+$/.test(line.trim())){
      flushPara(); closeLists();
      out.push("<hr />");
      continue;
    }

    // blank line
    if (!line.trim()){
      flushPara(); closeLists();
      continue;
    }

    // headings
    const h3 = line.match(/^###\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    const h1 = line.match(/^#\s+(.*)$/);
    if (h3 || h2 || h1){
      flushPara(); closeLists();
      const txt = inline((h3||h2||h1)[1].trim());
      if (h3) out.push(`<h3>${txt}</h3>`);
      else if (h2) out.push(`<h2>${txt}</h2>`);
      else out.push(`<h1>${txt}</h1>`);
      continue;
    }

    // ordered list
    const ol = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ol){
      flushPara();
      if (inUl){ out.push("</ul>"); inUl = false; }
      if (!inOl){ out.push("<ol>"); inOl = true; }
      out.push(`<li>${inline(ol[2].trim())}</li>`);
      continue;
    }

    // unordered list
    const ul = line.match(/^\s*[*-]\s+(.*)$/);
    if (ul){
      flushPara();
      if (inOl){ out.push("</ol>"); inOl = false; }
      if (!inUl){ out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(ul[1].trim())}</li>`);
      continue;
    }

    // default: paragraph accumulation
    para.push(line.trim());
  }

  flushPara(); closeLists();
  return out.join("\n");
}

function parseBlocks(mdText){
  const blocks = {};
  const re = /<!--BLOCK:([A-Z0-9_]+)-->([\s\S]*?)<!--\/BLOCK:\1-->/g;
  let m;
  while ((m = re.exec(mdText)) !== null){
    blocks[m[1]] = (m[2] || "").trim();
  }
  return blocks;
}

function stripMarkdownToText(md){
  // For headings stored as plain text, this is usually a no-op.
  return (md ?? "").toString()
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .trim();
}

async function initContent(){
  const url = document.documentElement.getAttribute("data-content-md") || CONTENT_MD_DEFAULT;
  try{
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error("content fetch failed");
    const md = await res.text();
    const blocks = parseBlocks(md);

    const nodes = document.querySelectorAll("[data-md]");
    nodes.forEach(el => {
      const key = el.getAttribute("data-md");
      const mode = el.getAttribute("data-md-mode") || "md";
      const block = blocks[key] || "";
      if (mode === "text"){
        el.textContent = stripMarkdownToText(block);
      } else {
        el.innerHTML = renderMarkdownLite(block);
      }
    });
  } catch (e){
    // If content.md fails to load, page still works; keep built-in fallback text.
    console.warn("Could not load content.md:", e);
  }
}

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

  function update(){
    const max = el.scrollWidth - el.clientWidth - 1;
    if (prev) prev.disabled = el.scrollLeft <= 2;
    if (next) next.disabled = el.scrollLeft >= max;
  }
  el.addEventListener("scroll", () => window.requestAnimationFrame(update));
  update();
}

// Init
initToolEmbed();
initCarousel();
initContent();