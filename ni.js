// Name Inclusion: load content.md key blocks into the tab.
// No external deps. Safe markdown-lite renderer.
(function(){
  const CONTENT_URL = "content.md";

  const KEY_RE = /^[A-Z0-9_]+$/;

  function escapeHtml(s){
    return (s ?? "").toString()
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#39;");
  }

  function inline(s){
    s = escapeHtml(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // simple italics
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return s;
  }

  // supports:
  // - paragraphs
  // - ### headings
  // - bullets starting with • or * or -
  // - ordered lists "1."
  function render(md){
    const src = (md ?? "").replace(/\r\n/g, "\n");
    const lines = src.split("\n");
    let out = [];
    let para = [];
    let inUl = false;
    let inOl = false;

    function flushPara(){
      if (!para.length) return;
      const t = para.join(" ").trim();
      if (t) out.push(`<p>${inline(t)}</p>`);
      para = [];
    }
    function closeLists(){
      if (inUl){ out.push("</ul>"); inUl = false; }
      if (inOl){ out.push("</ol>"); inOl = false; }
    }

    for (let raw of lines){
      const line = raw.trimEnd();

      if (!line.trim()){
        flushPara(); closeLists(); continue;
      }

      if (/^---+$/.test(line.trim())){
        flushPara(); closeLists(); out.push("<hr/>"); continue;
      }

      const h = line.match(/^###\s+(.*)$/);
      if (h){
        flushPara(); closeLists();
        out.push(`<h4>${inline(h[1].trim())}</h4>`);
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

      const ul = line.match(/^\s*[•*-]\s+(.*)$/);
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

  function parseKeyBlocks(text){
    const blocks = {};
    const lines = (text ?? "").replace(/\r\n/g, "\n").split("\n");
    let current = null;
    let buf = [];

    function flush(){
      if (current){
        blocks[current] = buf.join("\n").trim();
      }
      buf = [];
    }

    for (const raw of lines){
      const line = raw.trim();
      if (line && KEY_RE.test(line) && line.includes("_")){
        flush();
        current = line;
        continue;
      }
      if (current !== null) buf.push(raw);
    }
    flush();
    return blocks;
  }

  async function init(){
    try{
      const res = await fetch(CONTENT_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error("content.md fetch failed: " + res.status);
      const txt = await res.text();
      const blocks = parseKeyBlocks(txt);

      // Fill text nodes
      document.querySelectorAll("[data-ni-text]").forEach(el => {
        const key = el.getAttribute("data-ni-text");
        const v = (blocks[key] ?? "").trim();
        if (v) el.textContent = v;
      });

      // Fill markdown nodes
      document.querySelectorAll("[data-ni-md]").forEach(el => {
        const key = el.getAttribute("data-ni-md");
        const v = (blocks[key] ?? "").trim();
        if (v) el.innerHTML = render(v);
      });

      // Optional: if missing keys, show a subtle warning in console.
      const required = ["HERO_HEADING","HERO_BODY","LEARNING_HEADING","LEARNING_BODY","SHARING_HEADING","SHARING_BODY"];
      const missing = required.filter(k => !(blocks[k] ?? "").trim());
      if (missing.length){
        console.warn("Name inclusion: missing blocks in content.md:", missing);
      }
    } catch (e){
      console.warn("Name inclusion: content loader failed:", e);
    }
  }

  // Only run if the tab exists
  if (document.getElementById("tab-content-3")) init();
})();
