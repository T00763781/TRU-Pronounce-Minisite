const TOOL_URL_DEFAULT = "https://t00763781.github.io/TRU-Name-Pronouncer/embed.html";
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

function renderMarkdownLite(md){
  const src = escapeHtml(md).replace(/\r\n/g, "\n");
  const lines = src.split("\n");

  let out = [];
  let para = [];
  let inUl = false;
  let inOl = false;

  const inline = (s) => {
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return s;
  };

  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(" ").trim();
    if (text) out.push(`<p>${inline(text)}</p>`);
    para = [];
  };

  const closeLists = () => {
    if (inUl){ out.push("</ul>"); inUl = false; }
    if (inOl){ out.push("</ol>"); inOl = false; }
  };

  for (let raw of lines){
    const line = raw.trimEnd();

    if (/^---+$/.test(line.trim())){
      flushPara(); closeLists();
      out.push("<hr />");
      continue;
    }
    if (!line.trim()){
      flushPara(); closeLists();
      continue;
    }

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

    const ol = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ol){
      flushPara();
      if (inUl){ out.push("</ul>"); inUl = false; }
      if (!inOl){ out.push("<ol>"); inOl = true; }
      out.push(`<li>${inline(ol[2].trim())}</li>`);
      continue;
    }

    const ul = line.match(/^\s*(?:[*-]|•)\s+(.*)$/);
    if (ul){
      flushPara();
      if (inOl){ out.push("</ol>"); inOl = false; }
      if (!inUl){ out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(ul[1].trim())}</li>`);
      continue;
    }

    para.push(line.trim());
  }

  flushPara(); closeLists();
  return out.join("\n");
}

function parseKeyBlocks(mdText){
  const lines = (mdText ?? "").replace(/\r\n/g, "\n").split("\n");
  const isKey = (s) => /^[A-Z][A-Z0-9_]{2,}$/.test(s.trim());
  const blocks = {};
  let key = null;
  let buf = [];

  const flush = () => {
    if (!key) return;
    blocks[key] = buf.join("\n").trim();
    buf = [];
  };

  for (const ln of lines){
    const t = ln.trim();
    if (isKey(t)){
      flush();
      key = t;
      continue;
    }
    if (key) buf.push(ln);
  }
  flush();
  return blocks;
}

function initToolEmbed(){
  const iframe = $("toolFrame");
  if (!iframe) return;
  const url = document.documentElement.getAttribute("data-tool-url") || TOOL_URL_DEFAULT;
  iframe.src = url;
  document.querySelectorAll("[data-tool-link]").forEach(a => {
    a.setAttribute("href", url.replace(/\/embed\.html$/,"/"));
  });
}

function initCarousel(){
  const el = $("carousel");
  if (!el) return;
  const prev = $("prevBtn");
  const next = $("nextBtn");

  const scrollByCard = (dir) => {
    const card = el.querySelector(".slide");
    const w = card ? card.getBoundingClientRect().width : 360;
    el.scrollBy({ left: dir * (w + 12), behavior: "smooth" });
  };

  prev?.addEventListener("click", () => scrollByCard(-1));
  next?.addEventListener("click", () => scrollByCard(1));

  const update = () => {
    const max = el.scrollWidth - el.clientWidth - 1;
    if (prev) prev.disabled = el.scrollLeft <= 2;
    if (next) next.disabled = el.scrollLeft >= max;
  };
  el.addEventListener("scroll", () => window.requestAnimationFrame(update));
  update();
}

function showDiagnostics(msg){
  const id = "diag";
  let d = document.getElementById(id);
  if (!d){
    d = document.createElement("div");
    d.id = id;
    d.style.cssText = "position:fixed;right:12px;bottom:12px;max-width:440px;background:rgba(11,59,73,.96);color:#fff;padding:10px 12px;border-radius:12px;font:12px/1.35 Arial;box-shadow:0 10px 30px rgba(0,0,0,.25);z-index:9999";
    document.body.appendChild(d);
  }
  d.textContent = msg;
}

async function initContent(){
  const url = document.documentElement.getAttribute("data-content-md") || CONTENT_MD_DEFAULT;
  try{
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
    const md = await res.text();
    const blocks = parseKeyBlocks(md);

    const nodes = document.querySelectorAll("[data-md]");
    const missing = [];
    nodes.forEach(el => {
      const key = el.getAttribute("data-md");
      const mode = el.getAttribute("data-md-mode") || "md";
      const block = blocks[key] ?? "";
      if (!block) missing.push(key);

      if (mode === "text"){
        if (block.trim()) el.textContent = block.trim();
      } else {
        if (block.trim()) el.innerHTML = renderMarkdownLite(block);
      }
    });

    if (missing.length){
      showDiagnostics("Content loaded, but missing keys: " + missing.join(", "));
    }
  } catch (e){
    showDiagnostics("Could not load content.md. " + (e?.message || e));
    console.warn(e);
  }
}

initToolEmbed();
initCarousel();
initContent();