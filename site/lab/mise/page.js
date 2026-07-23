// page.js — tiny vanilla interactivity for the mise guide: a light/dark toggle
// (persisted, matching the other lab pages) and the activate/shims tab switch.
// No framework — this is a static page.
(function () {
  var STORE_THEME = "mise-guide:theme";
  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute("data-theme") || "light";
  }
  function syncToggle() {
    var t = currentTheme();
    document.querySelectorAll("#themeToggle button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-theme-set") === t);
    });
  }
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem(STORE_THEME, t); } catch (e) {}
    syncToggle();
  }

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-theme-set]");
      if (btn) setTheme(btn.getAttribute("data-theme-set"));
    });
    syncToggle();
  }

  // activate / shims tabs
  var tabs = document.getElementById("modeTabs");
  if (tabs) {
    tabs.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-tab]");
      if (!btn) return;
      var name = btn.getAttribute("data-tab");
      tabs.querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b === btn); });
      document.querySelectorAll("[data-panel]").forEach(function (p) {
        p.classList.toggle("on", p.getAttribute("data-panel") === name);
      });
    });
  }
})();
