// Accessible tab switching + deep linking to #tab-content-X
(function(){
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  function show(panelId, focusTab=false){
    tabs.forEach(t => {
      const selected = t.getAttribute("aria-controls") === panelId;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
      if (selected && focusTab) t.focus();
    });
    panels.forEach(p => {
      const on = p.id === panelId;
      if (on) p.removeAttribute("hidden");
      else p.setAttribute("hidden", "");
    });
  }

  tabs.forEach(t => {
    t.addEventListener("click", () => {
      const id = t.getAttribute("aria-controls");
      show(id, true);
      history.replaceState(null, "", "#" + id);
    });

    t.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(t);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft"){
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const next = (i + dir + tabs.length) % tabs.length;
        tabs[next].click();
      }
    });
  });

  const hash = (location.hash || "").replace("#","");
  if (hash && document.getElementById(hash)){
    show(hash, false);
  } else {
    show("tab-content-1", false);
  }
})();
