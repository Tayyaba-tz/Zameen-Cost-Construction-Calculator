// ===================== DROPDOWN MENUS (Tools / Buy) =====================
const dropdowns = document.querySelectorAll("[data-dropdown]");

const closeAllDropdowns = (except = null) => {
  dropdowns.forEach((dropdown) => {
    if (dropdown !== except) {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".dropdown__toggle").setAttribute("aria-expanded", "false");
    }
  });
};

dropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector(".dropdown__toggle");

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.contains("is-open");

    closeAllDropdowns();

    if (!isOpen) {
      dropdown.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
});

// Close any open dropdown when clicking outside of it
document.addEventListener("click", () => closeAllDropdowns());

// Close dropdowns on Escape key, for keyboard users
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAllDropdowns();
});

// ===================== BUY MENU (horizontal expand, not a popup) =====================
const buyExpand = document.querySelector("[data-buy-expand]");

if (buyExpand) {
  const buyToggle = buyExpand.querySelector(".buy-expand__toggle");

  buyToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = buyExpand.classList.toggle("is-open");
    buyToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!buyExpand.contains(event.target)) {
      buyExpand.classList.remove("is-open");
      buyToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// ===================== POPULAR CALCULATIONS CAROUSEL =====================
const popularTrack = document.getElementById("popularTrack");
const popularPrev = document.getElementById("popularPrev");
const popularNext = document.getElementById("popularNext");

if (popularTrack && popularPrev && popularNext) {
  const scrollByAmount = () => {
    const firstCard = popularTrack.querySelector(".popular__card");
    const cardWidth = firstCard ? firstCard.offsetWidth : 200;
    const gap = 14;
    return cardWidth + gap;
  };

  const updateArrowVisibility = () => {
    const atStart = popularTrack.scrollLeft <= 4;
    const atEnd = popularTrack.scrollLeft + popularTrack.clientWidth >= popularTrack.scrollWidth - 4;

    popularPrev.classList.toggle("is-hidden", atStart);
    popularNext.classList.toggle("is-hidden", atEnd);
  };

  popularPrev.addEventListener("click", () => {
    popularTrack.scrollBy({ left: -scrollByAmount(), behavior: "smooth" });
  });

  popularNext.addEventListener("click", () => {
    popularTrack.scrollBy({ left: scrollByAmount(), behavior: "smooth" });
  });

  popularTrack.addEventListener("scroll", updateArrowVisibility);
  window.addEventListener("resize", updateArrowVisibility);
  updateArrowVisibility();
}

// ===================== CALCULATOR: City / Area-Unit dropdown selection =====================
const cityToggle = document.getElementById("cityToggle");
const unitToggle = document.getElementById("unitToggle");

document.querySelectorAll("[data-city]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const city = link.dataset.city;
    cityToggle.textContent = city;
    cityToggle.dataset.value = city;
    document.querySelectorAll("[data-city]").forEach((l) => l.classList.toggle("is-current", l === link));
    closeAllDropdowns();
  });
});

document.querySelectorAll("[data-unit]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const unit = link.dataset.unit;
    unitToggle.querySelector(".calc-field__unit-label").textContent = unit;
    unitToggle.dataset.value = unit;
    document.querySelectorAll("[data-unit]").forEach((l) => l.classList.toggle("is-current", l === link));
    closeAllDropdowns();
  });
});

// ===================== CALCULATOR: Construction Type / Mode pill toggles =====================
document.querySelectorAll(".pill-group").forEach((group) => {
  const pills = group.querySelectorAll(".pill-btn");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
    });
  });
});

// ===================== CALC-BOX SPACER (keeps content below clear of the overlapping box) =====================
const calcBoxWrap = document.querySelector(".calc-box-wrap");
const calcBoxSpacer = document.getElementById("calcBoxSpacer");

const updateCalcBoxSpacer = () => {
  if (!calcBoxWrap || !calcBoxSpacer) return;
  const banner = document.querySelector(".banner");
  const wrapRect = calcBoxWrap.getBoundingClientRect();
  const bannerRect = banner.getBoundingClientRect();
  // how far the box's bottom edge sticks out below the banner's bottom edge
  const overhang = Math.max(0, wrapRect.bottom - bannerRect.bottom);
  calcBoxSpacer.style.height = overhang > 0 ? `${overhang + 40}px` : "40px";
};

// ===================== CALCULATOR: More Options / Less Options =====================
const calcBox = document.getElementById("calcBox");
const moreOptionsBtn = document.getElementById("moreOptionsBtn");

if (calcBox && moreOptionsBtn) {
  const moreLabel = moreOptionsBtn.querySelector(".calc-box__more-label");

  moreOptionsBtn.addEventListener("click", () => {
    const isExpanded = calcBox.classList.toggle("is-expanded");
    moreOptionsBtn.classList.toggle("is-expanded", isExpanded);
    moreOptionsBtn.setAttribute("aria-expanded", String(isExpanded));
    moreLabel.textContent = isExpanded ? "Less Options" : "More Options";
    updateCalcBoxSpacer();
  });
}

// ===================== CALCULATOR: Calculate Cost =====================
// Formulas below are reverse-engineered from real Zameen result pages, cross-checked
// against TWO independently verified examples (Lahore, 5 Marla / 2,025 sq ft):
//   Complete, With Material:    Total 93.96L = Grey 47.05L + Finishing 36.89L + Labour 10.02L
//   Complete, Without Material: Total 93.57L = Grey 48.01L + Finishing 36.89L + Labour 8.67L
// Both reproduce exactly with the per-sq-ft rates below. One correction made along the way:
// an uploaded reference document listed Labour rates as "Without Material: 495/sqft,
// With Material: 428/sqft" — cross-checking that against the two real examples above
// shows the labels are swapped (With Material actually verifies to ~495/sqft, Without
// to ~428/sqft), so the rates below use the empirically-correct assignment.
//
// Covered-area-per-Marla ratio is NOT constant, it shrinks as plot size grows (confirmed
// against the real "Popular Calculations" cards already used elsewhere on this page):
// 405 sq ft/Marla up to 5 Marla, tapering down to 315 sq ft/Marla at 1 Kanal (20 Marla).

const MARLA_PER_KANAL = 20;

// Real (marla, sq ft) anchor points taken from Zameen's own Popular Calculations cards
const COVERED_AREA_TABLE = [
  { marla: 3, sqft: 1215 },
  { marla: 4, sqft: 1620 },
  { marla: 5, sqft: 2025 },
  { marla: 6, sqft: 2295 },
  { marla: 7, sqft: 2678 },
  { marla: 8, sqft: 3060 },
  { marla: 10, sqft: 3375 },
  { marla: 20, sqft: 6300 },
];

// Piecewise-linear interpolation across the real anchor points above; holds the first/last
// known ratio steady for sizes outside the table instead of guessing beyond the data.
const marlaToCoveredSqft = (marla) => {
  const table = COVERED_AREA_TABLE;
  if (marla <= table[0].marla) {
    return marla * (table[0].sqft / table[0].marla);
  }
  if (marla >= table[table.length - 1].marla) {
    return marla * (table[table.length - 1].sqft / table[table.length - 1].marla);
  }
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (marla >= a.marla && marla <= b.marla) {
      const t = (marla - a.marla) / (b.marla - a.marla);
      return a.sqft + t * (b.sqft - a.sqft);
    }
  }
  return marla * 405; // fallback, should not be reached
};

const toSquareFeet = (size, unit) => {
  switch (unit) {
    case "Marla":
      return marlaToCoveredSqft(size);
    case "Kanal":
      return marlaToCoveredSqft(size * MARLA_PER_KANAL);
    case "Square Yards":
      return size * 9;
    case "Square Meters":
      return size * 10.764;
    case "Acre":
      return size * 43560;
    case "Square Feet":
    default:
      return size;
  }
};

const CITY_MULTIPLIER = {
  Lahore: 1.0,
  Karachi: 1.08,
  Islamabad: 1.12,
};

// Verified per-sq-ft rates (Lahore, Standard grade), split by construction type and mode
const RATES_PER_SQFT = {
  complete: {
    with: { greyMaterial: 2323.5, finishMaterial: 1821.7, labour: 494.8 },
    without: { greyMaterial: 2370.9, finishMaterial: 1821.7, labour: 428.1 },
  },
  grey: {
    // Only one verified data point exists for Grey Structure (With Material).
    // The "without" rates are estimated by applying the same relative with/without
    // shift observed for Complete construction, not independently verified.
    with: { greyMaterial: 2072.1, labour: 481.0 },
    without: { greyMaterial: 2114.4, labour: 416.1 },
  },
};

// Formats a number using Pakistani digit grouping (last 3 digits, then pairs):
// e.g. 4621 -> "4,621", 1234567 -> "12,34,567"
const formatIndianGrouping = (num) => {
  const rounded = Math.round(num);
  const isNegative = rounded < 0;
  const digits = Math.abs(rounded).toString();
  const lastThree = digits.slice(-3);
  const otherDigits = digits.slice(0, -3);
  const groupedRest = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const combined = otherDigits ? `${groupedRest},${lastThree}` : lastThree;
  return (isNegative ? "-" : "") + combined;
};

// Amounts of Rs 1,00,000 (1 Lakh) and above switch to Lakh / Crore, matching
// how Zameen itself displays results (e.g. "93.96 Lakh") rather than a long
// string of digits. Smaller amounts (like Price per Sq. Ft.) stay as plain
// rupees with Pakistani-style comma grouping.
const formatCurrency = (amount) => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) {
    return "Rs " + (amount / 10000000).toFixed(2) + " Crore";
  }
  if (absAmount >= 100000) {
    return "Rs " + (amount / 100000).toFixed(2) + " Lakh";
  }
  return "Rs " + formatIndianGrouping(amount);
};

const calculateBtn = document.getElementById("calculateBtn");
const calcResults = document.getElementById("calcResults");
const resFinishRow = document.getElementById("resFinishRow");

if (calculateBtn && calcResults) {
  calculateBtn.addEventListener("click", () => {
    const city = cityToggle.dataset.value || "Lahore";
    const unit = unitToggle.dataset.value || "Marla";
    const areaSizeInput = Number(document.getElementById("areaSize").value);
    const coveredAreaInput = Number(document.getElementById("coveredArea").value);

    // Use covered area if the person typed one directly, otherwise derive it from area size + unit
    const coveredArea = coveredAreaInput > 0
      ? coveredAreaInput
      : toSquareFeet(areaSizeInput > 0 ? areaSizeInput : 5, unit);

    const constructionType = calcBox.querySelector("#constructionTypeField .pill-btn.is-active").dataset.value; // "grey" or "complete"
    const constructionMode = calcBox.querySelector("#constructionModeField .pill-btn.is-active").dataset.value; // "with" or "without"

    const cityMultiplier = CITY_MULTIPLIER[city] || 1;
    const rates = RATES_PER_SQFT[constructionType][constructionMode];

    // Formula: each bucket = Covered Area x its own per-sq-ft rate x city multiplier
    const greyMaterialCost = coveredArea * rates.greyMaterial * cityMultiplier;
    const labourCost = coveredArea * rates.labour * cityMultiplier;
    const finishMaterialCost = constructionType === "complete"
      ? coveredArea * rates.finishMaterial * cityMultiplier
      : 0;

    const totalCost = greyMaterialCost + finishMaterialCost + labourCost;

    // Price per Sq. Ft. = Total Cost / Covered Area
    const pricePerSqft = totalCost / coveredArea;

    document.getElementById("resGreyMaterial").textContent = formatCurrency(greyMaterialCost);
    document.getElementById("resLabour").textContent = formatCurrency(labourCost);
    document.getElementById("resTotal").textContent = formatCurrency(totalCost);
    document.getElementById("resPerSqft").textContent = formatCurrency(pricePerSqft);

    if (constructionType === "complete") {
      resFinishRow.style.display = "flex";
      document.getElementById("resFinishMaterial").textContent = formatCurrency(finishMaterialCost);
    } else {
      resFinishRow.style.display = "none";
    }

    calcResults.classList.remove("is-hidden");
    updateCalcBoxSpacer();
    calcResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

window.addEventListener("load", updateCalcBoxSpacer);
window.addEventListener("resize", updateCalcBoxSpacer);
updateCalcBoxSpacer();


// ===================== MOBILE HAMBURGER MENU =====================
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

hamburgerBtn.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("is-open");
  hamburgerBtn.classList.toggle("is-open", isOpen);
  hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
});

// Close the mobile menu automatically if the window is resized back to desktop width
// (must match the max-width used in style.css for the hamburger breakpoint)
const MOBILE_BREAKPOINT = 768;

window.addEventListener("resize", () => {
  if (window.innerWidth > MOBILE_BREAKPOINT && mobileMenu.classList.contains("is-open")) {
    mobileMenu.classList.remove("is-open");
    hamburgerBtn.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
  }
});