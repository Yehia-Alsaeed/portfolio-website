// Static, dependency-free IIFE injected into <head> so the stored display mode
// is applied before hydration. It must never throw and never reference module
// values, so the storage key and mode list are duplicated here as literals.
export const DISPLAY_MODE_BOOT_SCRIPT = `(function () {
  var mode = "paper";
  try {
    var stored = window.localStorage.getItem("ya-display-mode:v1");
    if (stored === "night" || stored === "mono" || stored === "paper") {
      mode = stored;
    }
  } catch (error) {}
  document.documentElement.dataset.mode = mode;
  document.documentElement.style.colorScheme = mode === "night" ? "dark" : "light";
})();`;
