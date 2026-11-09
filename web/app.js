/* CareAccess Bengaluru — app.js
   Vanilla JS, no build step, no external runtime deps.
   Expects i18n.js (I18N, t()) to be loaded first.
*/

/* ── Embedded facility data (mirrors data/facilities.json) ──────────── */
const FACILITIES = [
  {
    id: "uphc-shivajinagar",
    name: "BBMP UPHC Shivajinagar",
    type: "uphc",
    area: "Shivajinagar",
    zone: "East",
    address: "BBMP Urban Primary Health Centre, Shivajinagar, Bengaluru \u2013 560001",
    phone: "080-22221600",
    timings: "Mon\u2013Sat 08:00\u201316:00",
    services: ["general", "fever", "vaccination", "maternal", "child"],
    documents_required: ["Aadhaar card or any government photo ID", "BBMP voter card (if available)"],
  },
  {
    id: "uphc-rajajinagar",
    name: "BBMP UPHC Rajajinagar",
    type: "uphc",
    area: "Rajajinagar",
    zone: "West",
    address: "BBMP Urban Primary Health Centre, Rajajinagar, Bengaluru \u2013 560010",
    timings: "Mon\u2013Sat 08:00\u201316:00",
    services: ["general", "fever", "vaccination", "maternal", "child"],
    documents_required: ["Aadhaar card or any government photo ID"],
  },
  {
    id: "uphc-jayanagar",
    name: "BBMP UPHC Jayanagar",
    type: "uphc",
    area: "Jayanagar",
    zone: "South",
    address: "BBMP Urban Primary Health Centre, Jayanagar 4th Block, Bengaluru \u2013 560041",
    timings: "Mon\u2013Sat 08:00\u201316:00",
    services: ["general", "fever", "vaccination", "maternal", "child"],
    documents_required: ["Aadhaar card or any government photo ID"],
  },
  {
    id: "uphc-yelahanka",
    name: "BBMP UPHC Yelahanka",
    type: "uphc",
    area: "Yelahanka",
    zone: "North",
    address: "BBMP Urban Primary Health Centre, Yelahanka New Town, Bengaluru \u2013 560064",
    timings: "Mon\u2013Sat 08:00\u201316:00",
    services: ["general", "fever", "vaccination", "maternal", "child"],
    documents_required: ["Aadhaar card or any government photo ID"],
  },
  {
    id: "uphc-whitefield",
    name: "BBMP UPHC Whitefield",
    type: "uphc",
    area: "Whitefield",
    zone: "East",
    address: "BBMP Urban Primary Health Centre, Whitefield Main Road, Bengaluru \u2013 560066",
    timings: "Mon\u2013Sat 08:00\u201316:00",
    services: ["general", "fever", "vaccination", "maternal", "child"],
    documents_required: ["Aadhaar card or any government photo ID"],
  },
  {
    id: "uphc-hsr-layout",
    name: "BBMP UPHC HSR Layout",
    type: "uphc",
    area: "HSR Layout",
    zone: "South",
    address: "BBMP Urban Primary Health Centre, HSR Layout Sector 2, Bengaluru \u2013 560102",
    timings: "Mon\u2013Sat 08:00\u201316:00",
    services: ["general", "fever", "vaccination", "maternal", "child"],
    documents_required: ["Aadhaar card or any government photo ID"],
  },
  {
    id: "bbmp-referral-hosp-malleswaram",
    name: "BBMP Referral Hospital Malleswaram",
    type: "referral_hospital",
    area: "Malleswaram",
    zone: "West",
    address: "BBMP Referral Hospital, 11th Cross, Malleswaram, Bengaluru \u2013 560003",
    phone: "080-23344100",
    timings: "24 hours, 7 days",
    services: ["general", "fever", "maternal", "child", "injury", "dental"],
    documents_required: [
      "Aadhaar card or government photo ID",
      "Referral letter from UPHC (preferred, not mandatory for emergency)",
    ],
  },
  {
    id: "bbmp-referral-hosp-jayanagar",
    name: "BBMP Referral Hospital Jayanagar",
    type: "referral_hospital",
    area: "Jayanagar",
    zone: "South",
    address: "BBMP Referral Hospital, 9th Block, Jayanagar, Bengaluru \u2013 560069",
    timings: "24 hours, 7 days",
    services: ["general", "fever", "maternal", "child", "injury", "dental"],
    documents_required: [
      "Aadhaar card or government photo ID",
      "Referral letter from UPHC (preferred)",
    ],
  },
  {
    id: "victoria-hospital",
    name: "Victoria Hospital (Bowring and Lady Curzon Road Campus)",
    type: "government_specialty",
    area: "Krishnarajapuram / City Market",
    zone: "Central",
    address: "Victoria Hospital, Ft. Road, Near City Market, Bengaluru \u2013 560002",
    phone: "080-26701150",
    timings: "OPD: Mon\u2013Sat 08:00\u201313:00; Emergency: 24 hours",
    services: ["general", "fever", "maternal", "child", "injury", "cardiac", "cancer", "mental", "dental"],
    documents_required: [
      "Aadhaar card or government photo ID",
      "Referral letter for specialty OPD",
    ],
  },
  {
    id: "bowring-lady-curzon",
    name: "Bowring and Lady Curzon Hospital",
    type: "government_specialty",
    area: "Shivajinagar",
    zone: "Central",
    address: "Bowring and Lady Curzon Hospital, Hospital Road, Shivajinagar, Bengaluru \u2013 560001",
    phone: "080-25320750",
    timings: "OPD: Mon\u2013Sat 08:00\u201313:00; Emergency: 24 hours",
    services: ["general", "fever", "maternal", "child", "injury", "dental"],
    documents_required: [
      "Aadhaar card or government photo ID",
      "Referral letter for specialty OPD (preferred)",
    ],
  },
  {
    id: "kc-general-hospital",
    name: "KC General Hospital",
    type: "government_specialty",
    area: "Malleswaram",
    zone: "West",
    address: "KC General Hospital, Malleshwaram, Bengaluru \u2013 560003",
    phone: "080-23460280",
    timings: "OPD: Mon\u2013Sat 08:00\u201313:00; Emergency: 24 hours",
    services: ["general", "fever", "maternal", "child", "injury", "dental"],
    documents_required: [
      "Aadhaar card or government photo ID",
      "Referral letter from UPHC or referral hospital (preferred)",
    ],
  },
  {
    id: "esic-hospital-rajajinagar",
    name: "ESIC Hospital Rajajinagar",
    type: "government_specialty",
    area: "Rajajinagar",
    zone: "West",
    address: "ESIC Hospital, Rajajinagar Industrial Area, Bengaluru \u2013 560010",
    phone: "080-23150330",
    timings: "OPD: Mon\u2013Sat 08:00\u201314:00; Emergency: 24 hours",
    services: ["general", "fever", "maternal", "child", "injury", "dental", "cardiac"],
    documents_required: ["ESIC card", "Aadhaar card or government photo ID"],
  },
  {
    id: "jayadeva-cardiovascular",
    name: "Sri Jayadeva Institute of Cardiovascular Sciences and Research",
    type: "government_specialty",
    area: "Jayanagar",
    zone: "South",
    address: "Sri Jayadeva Institute of Cardiovascular Sciences and Research, Bannerghatta Road, Jayanagar 9th Block, Bengaluru \u2013 560069",
    phone: "080-22977777",
    timings: "OPD: Mon\u2013Sat 08:00\u201313:00; Emergency: 24 hours",
    services: ["cardiac"],
    documents_required: [
      "Aadhaar card or government photo ID",
      "Referral letter",
      "Previous ECG/echo reports if available",
    ],
  },
  {
    id: "kidwai-oncology",
    name: "Kidwai Memorial Institute of Oncology",
    type: "government_specialty",
    area: "Hombegowda Nagar",
    zone: "South",
    address: "Kidwai Memorial Institute of Oncology, Dr. M H Marigowda Road, Hombegowda Nagar, Bengaluru \u2013 560029",
    phone: "080-26094000",
    timings: "OPD: Mon\u2013Sat 08:00\u201313:00; Emergency: 24 hours",
    services: ["cancer"],
    documents_required: [
      "Aadhaar card or government photo ID",
      "Referral letter",
      "Biopsy/pathology reports if available",
    ],
  },
  {
    id: "nimhans",
    name: "NIMHANS (National Institute of Mental Health and Neuro Sciences)",
    type: "government_specialty",
    area: "Lakkasandra",
    zone: "South",
    address: "NIMHANS, Hosur Road, Lakkasandra, Bengaluru \u2013 560029",
    phone: "080-46110007",
    timings: "OPD: Mon\u2013Sat 08:00\u201313:00; Emergency: 24 hours",
    services: ["mental"],
    documents_required: [
      "Aadhaar card or government photo ID",
      "Referral letter (strongly recommended for OPD)",
    ],
  },
  {
    id: "igich",
    name: "Indira Gandhi Institute of Child Health",
    type: "government_specialty",
    area: "Dharmaram College Post",
    zone: "South",
    address: "Indira Gandhi Institute of Child Health, Dharmaram College Post, Bengaluru \u2013 560029",
    phone: "080-26563574",
    timings: "OPD: Mon\u2013Sat 08:00\u201313:00; Emergency: 24 hours",
    services: ["child"],
    documents_required: [
      "Aadhaar card or government photo ID (child + guardian)",
      "Referral letter (preferred)",
    ],
  },
];

/* ── Offline keyword match ───────────────────────────────────────────── */
const FACILITY_TYPE_LABELS = {
  uphc: "BBMP UPHC (Urban Primary Health Centre)",
  referral_hospital: "BBMP Referral Hospital",
  government_specialty: "Government Specialty Hospital",
};

function offlineLookup(area, need) {
  const areaLower = (area || "").toLowerCase().trim();

  // Score each facility: +2 area match, +1 need match
  const scored = FACILITIES.map((f) => {
    let score = 0;
    if (areaLower && f.area.toLowerCase().includes(areaLower)) score += 2;
    if (need && f.services.includes(need)) score += 1;
    return { f, score };
  });

  // Sort: higher score first, then by facility type priority (uphc < referral < specialty)
  const typePriority = { uphc: 0, referral_hospital: 1, government_specialty: 2 };
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (typePriority[a.f.type] || 0) - (typePriority[b.f.type] || 0);
  });

  // Take up to 3 with score > 0; if none match at all, return top 3 by service
  let results = scored.filter((x) => x.score > 0).slice(0, 3).map((x) => x.f);
  if (results.length === 0) {
    results = scored
      .filter((x) => need && x.f.services.includes(need))
      .slice(0, 3)
      .map((x) => x.f);
  }
  if (results.length === 0) results = FACILITIES.slice(0, 3);

  // Determine recommended type from top result
  const recommendedType = results[0] ? FACILITY_TYPE_LABELS[results[0].type] || results[0].type : "";
  const callAhead = "Please call the facility ahead of your visit to confirm timings and availability.";

  return { recommendedType, facilities: results, callAhead };
}

/* ── Minimal markdown -> HTML (bold, italic, lists, paragraphs) ──────── */
function markdownToHtml(md) {
  if (!md) return "";
  let html = md
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Unordered list items (- or *)
    .replace(/^[ \t]*[-*] (.+)$/gm, "<li>$1</li>")
    // Numbered list items
    .replace(/^[ \t]*\d+\. (.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>[\s\S]+?<\/li>)(\s*(?!<li>))/g, "<ul>$1</ul>$2")
    // Line breaks into paragraphs
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (block.startsWith("<ul>") || block.startsWith("<li>")) return block;
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
  return html;
}

/* ── DOM helpers ─────────────────────────────────────────────────────── */
function el(id) { return document.getElementById(id); }

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── i18n helpers ────────────────────────────────────────────────────── */
window.__CAB_LANG__ = "EN";

function applyTranslations() {
  // Elements with data-i18n (text content)
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    node.textContent = t(key);
  });
  // Elements with data-i18n-placeholder (placeholder attribute)
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    node.setAttribute("placeholder", t(key));
  });
  // Update <html lang>
  const langMap = { EN: "en", KN: "kn", HI: "hi" };
  document.documentElement.lang = langMap[window.__CAB_LANG__] || "en";
}

/* ── Language switcher ───────────────────────────────────────────────── */
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    window.__CAB_LANG__ = lang;
    // Update aria-pressed
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    applyTranslations();
    // Re-render results section if visible, to update static strings
    if (!el("results-section").hidden) {
      renderDisclaimer();
    }
  });
});

function renderDisclaimer() {
  const node = document.querySelector("#results-section .disclaimer");
  if (node) node.textContent = t("disclaimer");
}

/* ── Form validation ─────────────────────────────────────────────────── */
function showError(id, key) {
  const el_ = el(id);
  el_.textContent = t(key);
  el_.classList.add("visible");
}
function clearError(id) {
  const el_ = el(id);
  el_.textContent = "";
  el_.classList.remove("visible");
}

function validate(area, need) {
  let ok = true;
  clearError("area-error");
  clearError("need-error");
  if (!area.trim()) { showError("area-error", "error_area"); ok = false; }
  if (!need)        { showError("need-error", "error_need"); ok = false; }
  return ok;
}

/* ── Facility card renderer ──────────────────────────────────────────── */
function buildFacilityCard(f) {
  const phoneHtml = f.phone
    ? `<div class="meta-row">
         <span class="meta-label">${esc(t("phone_label"))}</span>
         <span><a href="tel:${esc(f.phone)}">${esc(f.phone)}</a></span>
       </div>`
    : "";

  const servicesTags = (f.services || [])
    .map((s) => `<span class="service-tag">${esc(s)}</span>`)
    .join("");

  const docItems = (f.documents_required || [])
    .map((d) => `<li>${esc(d)}</li>`)
    .join("");

  return `
    <article class="facility-card">
      <h3>${esc(f.name)}</h3>
      <div class="facility-meta">
        <div class="meta-row">
          <span class="meta-label">${esc(t("address_label"))}</span>
          <span>${esc(f.address)}</span>
        </div>
        ${phoneHtml}
        <div class="meta-row">
          <span class="meta-label">${esc(t("timings_label"))}</span>
          <span>${esc(f.timings)}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">${esc(t("services_label"))}</span>
          <span class="services-tags">${servicesTags}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">${esc(t("docs_label"))}</span>
          <ul class="docs-list">${docItems}</ul>
        </div>
      </div>
    </article>`;
}

/* ── Results renderer ────────────────────────────────────────────────── */
function renderResults({ recommendedType, facilities, callAhead, aiReplyMarkdown, offline }) {
  // Offline notice
  const offlineEl = el("offline-notice");
  offlineEl.hidden = !offline;
  if (offline) {
    offlineEl.querySelector("[data-i18n]").textContent = t("offline_notice");
  }

  // AI reply (only when online)
  const aiReplyEl = el("ai-reply");
  aiReplyEl.innerHTML = aiReplyMarkdown ? markdownToHtml(aiReplyMarkdown) : "";

  // Build facility output
  let html = "";

  if (recommendedType) {
    html += `<div class="facility-type-row">
      <span class="label">${esc(t("facility_type_label"))}</span>
      <span class="facility-type-pill">${esc(recommendedType)}</span>
    </div>`;
  }

  if (callAhead) {
    html += `<div class="call-ahead">
      <div class="label">${esc(t("call_ahead_label"))}</div>
      <div>${esc(callAhead)}</div>
    </div>`;
  }

  if (facilities && facilities.length > 0) {
    html += `<div class="facility-cards">`;
    facilities.forEach((f) => { html += buildFacilityCard(f); });
    html += `</div>`;
  }

  el("facility-output").innerHTML = html;

  // Update disclaimer text for current language
  renderDisclaimer();

  // Show section
  el("results-section").hidden = false;

  // Scroll into view
  el("results-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── Parse agent reply into structured data ──────────────────────────── */
function parseAgentResponse(data) {
  // data = { reply_markdown: "..." }
  // The proxy returns the raw agent text; we render it as markdown in #ai-reply.
  // We do not attempt to extract structured facility cards from the markdown
  // because the agent may format freely. Show reply + no cards from offline path.
  return {
    recommendedType: "",
    facilities: [],
    callAhead: "",
    aiReplyMarkdown: data.reply_markdown || "",
    offline: false,
  };
}

/* ── Loading state helpers ───────────────────────────────────────────── */
function setLoading(on) {
  const btn = el("submit-btn");
  const msg = el("loading-msg");
  btn.disabled = on;
  if (on) {
    msg.textContent = t("loading_msg");
    msg.classList.add("visible");
  } else {
    msg.classList.remove("visible");
  }
}

/* ── Form submit ─────────────────────────────────────────────────────── */
el("intake-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const area     = el("area-input").value.trim();
  const need     = el("need-select").value;
  const has_id   = document.querySelector('input[name="has_id"]:checked')?.value === "yes";
  const language = window.__CAB_LANG__ || "EN";

  if (!validate(area, need)) return;

  setLoading(true);
  el("results-section").hidden = true;
  el("ai-reply").innerHTML = "";
  el("facility-output").innerHTML = "";

  const payload = { area, need, has_id, language };

  try {
    const response = await fetch("/api/navigate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    setLoading(false);
    renderResults(parseAgentResponse(data));

  } catch (_err) {
    // Fetch failed (network error, proxy unreachable) — local fallback
    setLoading(false);
    const { recommendedType, facilities, callAhead } = offlineLookup(area, need);
    renderResults({ recommendedType, facilities, callAhead, aiReplyMarkdown: "", offline: true });
  }
});

/* ── Initial translation pass ────────────────────────────────────────── */
applyTranslations();
