/* ============ Demo behaviors: display modes · command palette · filters · form ============ */
(function () {
  var MODES = ["paper", "night", "mono"];

  /* ---------- display modes ---------- */
  function applyMode(m) {
    document.documentElement.dataset.mode = m;
    try { localStorage.setItem("ya-mode", m); } catch (e) {}
    document.querySelectorAll(".modes button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.m === m));
    });
  }
  function currentMode() { return document.documentElement.dataset.mode || "paper"; }
  function cycleMode() {
    var next = MODES[(MODES.indexOf(currentMode()) + 1) % MODES.length];
    applyMode(next);
  }
  try {
    var saved = localStorage.getItem("ya-mode");
    if (MODES.indexOf(saved) !== -1) applyMode(saved);
  } catch (e) {}
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".modes button");
    if (b) applyMode(b.dataset.m);
  });

  /* ---------- command palette ---------- */
  var ITEMS = [
    { label: "Home", hint: "page", href: "index.html" },
    { label: "All projects (17)", hint: "page", href: "projects.html" },
    { label: "Case study — SkillBridge AI Interviewer", hint: "page", href: "case-study.html" },
    { label: "Case study — Prestige Motors (live embed)", hint: "page", href: "case-study-prestige.html" },
    { label: "Case study — Oxford model microscope", hint: "page", href: "case-study-oxford.html" },
    { label: "Case study — Agent run replay", hint: "page", href: "case-study-agents.html" },
    { label: "Admin analytics demo", hint: "private page", href: "admin.html" },
    { label: "Services", hint: "page", href: "services.html" },
    { label: "404 demo", hint: "page", href: "404.html" },
    { label: "Work index", hint: "section", href: "index.html#work" },
    { label: "Experience & education", hint: "section", href: "index.html#about" },
    { label: "Contact", hint: "section", href: "index.html#contact" },
    { label: "Display: Paper", hint: "action", fn: function () { applyMode("paper"); } },
    { label: "Display: Night", hint: "action", fn: function () { applyMode("night"); } },
    { label: "Display: Mono", hint: "action", fn: function () { applyMode("mono"); } },
    { label: "Open Swiss poster mode", hint: "action", fn: openPoster },
    { label: "Toggle experimental scroll rules", hint: "action", fn: toggleScrollRules },
    { label: "Copy email address", hint: "action", fn: function () {
        if (navigator.clipboard) navigator.clipboard.writeText("yehias3eed11@gmail.com");
      } },
    { label: "Download CV", hint: "action (stub in demo)", fn: function () { alert("Demo: the real site serves the CV PDF here (tracked)."); } },
    { label: "GitHub profile ↗", hint: "external", href: "https://github.com/Yehia-Alsaeed", ext: true }
  ];

  var overlay = document.createElement("div");
  overlay.className = "pal-overlay";
  var pal = document.createElement("div");
  pal.className = "pal";
  pal.setAttribute("role", "dialog");
  pal.setAttribute("aria-label", "Command palette");
  pal.innerHTML =
    '<input type="text" placeholder="Type a command or search…" aria-label="Search commands">' +
    '<div class="pal-list"></div>' +
    '<div class="pal-foot"><span><kbd>↑↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>esc</kbd> close</span><span><kbd>N</kbd> cycle display mode</span></div>';
  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(overlay);
    document.body.appendChild(pal);
  });

  var input, list, results = [], active = 0, open = false;

  function renderList(q) {
    list = pal.querySelector(".pal-list");
    q = (q || "").trim().toLowerCase();
    results = ITEMS.filter(function (it) {
      return !q || it.label.toLowerCase().indexOf(q) !== -1 || it.hint.toLowerCase().indexOf(q) !== -1;
    });
    active = 0;
    if (!results.length) {
      list.innerHTML = '<div class="pal-empty">No matches — try "projects", "night", "contact"…</div>';
      return;
    }
    list.innerHTML = results.map(function (it, i) {
      return '<div class="pal-item' + (i === 0 ? " active" : "") + '" data-i="' + i + '"><span>' + it.label + '</span><span class="hint">' + it.hint + "</span></div>";
    }).join("");
  }
  function setActive(i) {
    active = (i + results.length) % results.length;
    var items = list.querySelectorAll(".pal-item");
    items.forEach(function (el, j) { el.classList.toggle("active", j === active); });
    if (items[active]) items[active].scrollIntoView({ block: "nearest" });
  }
  function run(it) {
    closePal();
    if (!it) return;
    if (it.fn) { it.fn(); return; }
    if (it.ext) { window.open(it.href, "_blank", "noopener"); return; }
    window.location.href = it.href;
  }
  function openPal() {
    open = true;
    overlay.classList.add("open");
    pal.classList.add("open");
    input = pal.querySelector("input");
    input.value = "";
    renderList("");
    input.focus();
  }
  function closePal() {
    open = false;
    overlay.classList.remove("open");
    pal.classList.remove("open");
    if (input) input.blur();
  }

  document.addEventListener("keydown", function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      open ? closePal() : openPal();
      return;
    }
    if (open) {
      if (e.key === "Escape") { closePal(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Enter") { e.preventDefault(); run(results[active]); }
      return;
    }
    if (!typing && (e.key === "n" || e.key === "N")) cycleMode();
  });
  overlay.addEventListener("click", closePal);
  pal.addEventListener("input", function (e) { if (e.target.tagName === "INPUT") renderList(e.target.value); });
  pal.addEventListener("click", function (e) {
    var el = e.target.closest(".pal-item");
    if (el) run(results[+el.dataset.i]);
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest(".kbd-hint")) openPal();
  });

  /* ---------- poster mode and removable scroll experiment ---------- */
  var poster = document.createElement("section");
  poster.className = "poster-overlay";
  poster.setAttribute("aria-label", "Swiss poster mode");
  poster.innerHTML = '<div class="poster-top"><span>Yehia Alsaeed / Cairo</span><button class="poster-close" type="button">Close</button></div><div class="poster-mark">Y<span>A.</span></div><div class="poster-foot"><span>AI / ML Engineer + Web Developer</span><span>0.93 mIoU · 17 projects</span></div>';
  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(poster);
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.appendChild(progress);
    var plate = document.createElement("div");
    plate.className = "page-plate";
    plate.setAttribute("aria-hidden", "true");
    document.body.appendChild(plate);
  });
  function openPoster() { poster.classList.add("open"); poster.querySelector("button").focus(); }
  function closePoster() { poster.classList.remove("open"); }
  poster.addEventListener("click", function (e) { if (e.target.closest(".poster-close")) closePoster(); });
  function toggleScrollRules() {
    var on = document.documentElement.dataset.scrollRules === "on";
    document.documentElement.dataset.scrollRules = on ? "off" : "on";
  }
  window.addEventListener("scroll", function () {
    if (document.documentElement.dataset.scrollRules !== "on") return;
    var max = document.documentElement.scrollHeight - innerHeight;
    var progress = document.querySelector(".scroll-progress");
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
    document.querySelectorAll(".sec-head").forEach(function (head) {
      var rect = head.getBoundingClientRect();
      head.classList.toggle("in-view", rect.top < innerHeight * .68 && rect.bottom > 0);
    });
  }, { passive: true });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && poster.classList.contains("open")) closePoster(); });
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href$=".html"]');
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (link.target || link.origin !== location.origin) return;
    e.preventDefault();
    var plate = document.querySelector(".page-plate");
    if (!plate) { location.href = link.href; return; }
    plate.classList.add("open");
    setTimeout(function () { location.href = link.href; }, 360);
  });

  /* ---------- project filters (projects page) ---------- */
  document.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    var f = chip.dataset.filter;
    document.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
    document.querySelectorAll(".pcard").forEach(function (card) {
      card.classList.toggle("hidden", f !== "all" && card.dataset.cat !== f);
    });
    var count = document.querySelectorAll(".pcard:not(.hidden)").length;
    var counter = document.getElementById("pcount");
    if (counter) counter.textContent = count + (count === 1 ? " project" : " projects");
  });

  /* ---------- live browser windows (click-to-load, scaled iframes, device toggle) ---------- */
  var DEVICES = { desktop: { w: 1280, h: 800 }, phone: { w: 390, h: 760 } };
  function deviceOf(browserEl) { return browserEl.classList.contains("phone") ? "phone" : "desktop"; }
  function frameSize(browserEl) {
    if (browserEl.hasAttribute("data-scrubber")) {
      var width = Number(browserEl.dataset.viewport || 1280);
      return { w: width, h: width <= 480 ? 760 : 800 };
    }
    return DEVICES[deviceOf(browserEl)];
  }
  function shellWidth(width) { return matchMedia("(max-width: 640px)").matches ? 100 : Math.min(100, width / 14.4); }
  function scaleFrames() {
    document.querySelectorAll(".browser-view iframe").forEach(function (f) {
      var browserEl = f.closest(".browser");
      var d = frameSize(browserEl);
      var shell = browserEl.querySelector(".browser-viewport-shell");
      if (shell) shell.style.width = shellWidth(d.w) + "%";
      var available = f.parentElement.clientWidth;
      var scale = available / d.w;
      f.style.width = d.w + "px";
      f.style.height = d.h + "px";
      f.style.transform = "scale(" + scale + ")";
      if (browserEl.hasAttribute("data-scrubber")) f.parentElement.style.height = Math.round(d.h * scale) + "px";
    });
  }
  window.addEventListener("resize", scaleFrames);
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".browser-load");
    if (btn) {
      var view = btn.parentElement;
      if (view.querySelector("iframe")) return;
      btn.querySelector("b").textContent = "loading live site…";
      var f = document.createElement("iframe");
      f.src = view.dataset.src;
      f.title = view.dataset.title || "Live site preview";
      f.setAttribute("loading", "lazy");
      f.addEventListener("load", function () { btn.remove(); });
      setTimeout(function () { if (btn.parentElement) btn.remove(); }, 8000);
      view.appendChild(f);
      scaleFrames();
      return;
    }
    var dev = e.target.closest(".dev-btn");
    if (dev) {
      var browserEl = dev.closest(".browser");
      browserEl.classList.toggle("phone", dev.dataset.dev === "phone");
      browserEl.querySelectorAll(".dev-btn").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === dev));
      });
      scaleFrames();
    }
    var preset = e.target.closest(".viewport-presets button");
    if (preset) {
      var scrubber = preset.closest(".browser[data-scrubber]");
      setViewport(scrubber, Number(preset.dataset.width));
    }
  });
  function setViewport(browserEl, width) {
    if (!browserEl) return;
    browserEl.dataset.viewport = String(width);
    var range = browserEl.querySelector('.viewport-control input[type="range"]');
    var label = browserEl.querySelector(".viewport-value");
    if (range) range.value = String(width);
    if (label) label.textContent = width + "px";
    browserEl.querySelectorAll(".viewport-presets button").forEach(function (button) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.width) === width));
    });
    var iframe = browserEl.querySelector("iframe");
    if (iframe) scaleFrames();
    else {
      var shell = browserEl.querySelector(".browser-viewport-shell");
      if (shell) shell.style.width = shellWidth(width) + "%";
    }
  }
  document.addEventListener("input", function (e) {
    if (!e.target.matches('.browser[data-scrubber] input[type="range"]')) return;
    setViewport(e.target.closest(".browser"), Number(e.target.value));
  });
  // mobile visitors get the phone-view embed by default — they experience the site's real mobile version
  if (matchMedia("(max-width: 640px)").matches) {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll(".browser[data-adaptive]").forEach(function (b) {
        if (b.hasAttribute("data-scrubber")) setViewport(b, 390);
        else {
          b.classList.add("phone");
          b.querySelectorAll(".dev-btn").forEach(function (x) {
            x.setAttribute("aria-pressed", String(x.dataset.dev === "phone"));
          });
        }
      });
    });
  }

  /* ---------- architecture x-ray ---------- */
  document.addEventListener("click", function (e) {
    var node = e.target.closest(".flow-node");
    if (node) {
      var module = node.closest(".architecture-xray");
      module.querySelectorAll(".flow-node").forEach(function (other) { other.setAttribute("aria-pressed", String(other === node)); });
      var inspector = module.querySelector(".proof-inspector");
      inspector.querySelector("h3").textContent = node.dataset.name;
      inspector.querySelector("p").textContent = node.dataset.copy;
      var values = inspector.querySelectorAll("dd");
      values[0].textContent = node.dataset.input;
      values[1].textContent = node.dataset.output;
    }
    var play = e.target.closest(".flow-play");
    if (play) replayFlow(play.closest(".architecture-xray"), play);
  });
  function replayFlow(module, button) {
    var nodes = Array.from(module.querySelectorAll(".flow-node"));
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    button.disabled = true;
    button.textContent = "Request running";
    nodes.forEach(function (node) { node.classList.remove("request-active"); });
    nodes.forEach(function (node, index) {
      setTimeout(function () {
        nodes.forEach(function (item) { item.classList.remove("request-active"); });
        node.classList.add("request-active");
        if (index === nodes.length - 1) setTimeout(function () { node.classList.remove("request-active"); button.disabled = false; button.textContent = "Play request"; }, reduced ? 0 : 550);
      }, reduced ? 0 : index * 600);
    });
  }

  /* ---------- model comparison microscope ---------- */
  var MODEL_DATA = {
    fcn: { image: "assets/pets-fcn.webp", label: "FCN-ResNet18 prediction set", miou: "0.88", time: "0.04s", note: "Fast" },
    segnet: { image: "assets/pets-segnet.webp", label: "SegNet-VGG16 prediction set", miou: "0.90", time: "0.08s", note: "Stable" },
    hrnet: { image: "assets/pets-hrnet.webp", label: "HRNet-W18 prediction set", miou: "0.93", time: "0.06s", note: "Best" }
  };
  document.addEventListener("click", function (e) {
    var tab = e.target.closest(".model-tabs button");
    if (!tab) return;
    var module = tab.closest(".model-microscope");
    var data = MODEL_DATA[tab.dataset.model];
    module.querySelectorAll(".model-tabs button").forEach(function (button) { button.setAttribute("aria-pressed", String(button === tab)); });
    module.querySelector(".model-image").src = data.image;
    module.querySelector(".model-image").alt = data.label;
    module.querySelector(".model-label").textContent = data.label;
    module.querySelector(".model-miou").textContent = data.miou;
    module.querySelector(".model-time").textContent = data.time;
    module.querySelector(".model-note").textContent = data.note;
  });

  /* ---------- deterministic agent replay ---------- */
  var AGENT_DATA = [
    { name: "Profiler", copy: "Turns subjects, deadlines, available hours, and learning preferences into a constrained student profile.", log: "INPUT  calculus, databases, 3h/day<br>TOOL   difficulty_classifier<br>OUTPUT weighted priorities + available blocks<br>TIME   1.2s · ACCEPTED" },
    { name: "Generator", copy: "Drafts the first complete weekly plan from the profile while preserving every hard time constraint.", log: "INPUT  profile.json<br>TOOL   safe_calculator<br>OUTPUT draft_plan_v1<br>TIME   2.8s · SENT TO CRITIC" },
    { name: "Critic", copy: "Checks workload balance, coverage, recovery time, and deadline risk before accepting the draft.", log: "INPUT  draft_plan_v1<br>CHECK  overload on Thursday<br>OUTPUT revision_request<br>TIME   1.7s · REVISE" },
    { name: "Optimizer", copy: "Moves two study blocks, resolves the critic finding, and emits the final plan plus a machine-readable run record.", log: "INPUT  revision_request<br>ACTION rebalance Thursday<br>OUTPUT plan.txt + run.json<br>TIME   1.4s · ACCEPTED" }
  ];
  function selectAgentStep(module, index) {
    var data = AGENT_DATA[index];
    module.querySelectorAll(".agent-step").forEach(function (button, i) { button.setAttribute("aria-pressed", String(i === index)); });
    module.querySelector(".agent-detail h3").textContent = data.name;
    module.querySelector(".agent-detail p").textContent = data.copy;
    module.querySelector(".agent-log").innerHTML = data.log;
    module.querySelector(".agent-status").textContent = "Step " + (index + 1) + " of 4";
  }
  document.addEventListener("click", function (e) {
    var step = e.target.closest(".agent-step");
    if (step) selectAgentStep(step.closest(".agent-run"), Number(step.dataset.step));
    var reset = e.target.closest(".agent-reset");
    if (reset) selectAgentStep(reset.closest(".agent-run"), 0);
    var play = e.target.closest(".agent-play");
    if (play) {
      var module = play.closest(".agent-run");
      var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      play.disabled = true;
      AGENT_DATA.forEach(function (_, index) { setTimeout(function () { selectAgentStep(module, index); if (index === AGENT_DATA.length - 1) play.disabled = false; }, reduced ? 0 : index * 850); });
    }
  });

  /* ---------- admin dashboard prototype ---------- */
  function refreshInboxCount(shell) {
    var count = shell.querySelectorAll(".message-row.unread").length;
    shell.querySelectorAll(".inbox-count").forEach(function (el) { el.textContent = String(count); });
  }
  document.addEventListener("click", function (e) {
    var view = e.target.closest("[data-admin-view]");
    if (view) {
      var shell = view.closest(".admin-shell");
      shell.dataset.view = view.dataset.adminView;
      shell.querySelectorAll("[data-admin-view]").forEach(function (button) { button.setAttribute("aria-pressed", String(button === view)); });
    }
    var message = e.target.closest(".message-row");
    if (message) {
      message.classList.toggle("unread");
      refreshInboxCount(message.closest(".admin-shell"));
    }
  });

  /* ---------- contact form (demo stub) ---------- */
  document.addEventListener("submit", function (e) {
    var form = e.target.closest(".cform");
    if (!form) return;
    e.preventDefault();
    var note = document.getElementById("form-note");
    if (note) {
      note.textContent = "→ message stored (demo) — on the real site this lands in your admin inbox + database";
      note.classList.add("ok");
    }
    form.reset();
  });
})();
