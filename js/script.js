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

const updateArrowVisibility = () => {
  if (!popularTrack || !popularPrev || !popularNext) return;
  const atStart = popularTrack.scrollLeft <= 4;
  const atEnd = popularTrack.scrollLeft + popularTrack.clientWidth >= popularTrack.scrollWidth - 4;

  popularPrev.classList.toggle("is-hidden", atStart);
  popularNext.classList.toggle("is-hidden", atEnd);
};

if (popularTrack && popularPrev && popularNext) {
  const scrollByAmount = () => {
    const firstCard = popularTrack.querySelector(".popular__card");
    const cardWidth = firstCard ? firstCard.offsetWidth : 200;
    const gap = 14;
    return cardWidth + gap;
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

// ===================== POPULAR CALCULATIONS: rebuild cards per selected city =====================
// URL suffix differs by city on the real site (confirmed by inspecting live pages):
// Lahore uses "-lahore-1", Karachi uses "-karachi-2", Islamabad uses "-islamabad-3".
const CITY_URL_SUFFIX = {
  Lahore: "lahore-1",
  Karachi: "karachi-2",
  Islamabad: "islamabad-3",
};

// (title, sub-line, url-slug) for each of the 12 popular cards; the same 12 sizes/types
// exist for every city, only the URL suffix and displayed city name change.
const POPULAR_CARD_DEFS = [
  { title: "3 Marla<br>Construction Cost", sub: "Double Story<br>1,215 Sq. ft.", slug: "3-marla-house-construction-cost" },
  { title: "4 Marla<br>Construction Cost", sub: "Double Story<br>1,620 Sq. ft.", slug: "4-marla-house-construction-cost" },
  { title: "5 Marla<br>Construction Cost", sub: "Double Story<br>2,025 Sq. ft.", slug: "5-marla-house-construction-cost" },
  { title: "6 Marla<br>Construction Cost", sub: "Double Story<br>2,295 Sq. ft.", slug: "6-marla-house-construction-cost" },
  { title: "7 Marla<br>Construction Cost", sub: "Double Story<br>2,678 Sq. ft.", slug: "7-marla-house-construction-cost" },
  { title: "8 Marla<br>Construction Cost", sub: "Double Story<br>3,060 Sq. ft.", slug: "8-marla-house-construction-cost" },
  { title: "10 Marla<br>Construction Cost", sub: "Double Story<br>3,375 Sq. ft.", slug: "10-marla-house-construction-cost" },
  { title: "1 Kanal<br>Construction Cost", sub: "Double Story<br>6,300 Sq. ft.", slug: "1-kanal-house-construction-cost" },
  { title: "3 Marla<br>Grey Structure Cost", sub: "Double Story<br>1,215 Sq. ft.", slug: "3-marla-grey-construction-cost" },
  { title: "5 Marla<br>Grey Structure Cost", sub: "Double Story<br>2,025 Sq. ft.", slug: "5-marla-grey-construction-cost" },
  { title: "10 Marla<br>Grey Structure Cost", sub: "Double Story<br>3,375 Sq. ft.", slug: "10-marla-grey-construction-cost" },
  { title: "1 Kanal<br>Grey Structure Cost", sub: "Double Story<br>6,300 Sq. ft.", slug: "1-kanal-grey-construction-cost" },
];

const popularHeading = document.getElementById("popularHeading");

const renderPopularCards = (city) => {
  if (!popularHeading || !popularTrack) return;
  const suffix = CITY_URL_SUFFIX[city] || CITY_URL_SUFFIX.Lahore;

  popularHeading.textContent = `Popular Calculations in ${city}`;
  popularTrack.innerHTML = POPULAR_CARD_DEFS.map((card) => `
    <a href="https://www.zameen.com/tools/construction-cost-calculator/${card.slug}-${suffix}/" class="popular__card">
      <span class="popular__card-title">${card.title}</span>
      <span class="popular__card-sub">${card.sub}</span>
      <span class="popular__card-details">Details &gt;</span>
    </a>
  `).join("");

  // scroll back to the start and refresh the carousel arrows for the new set of cards
  popularTrack.scrollLeft = 0;
  updateArrowVisibility();
};

document.querySelectorAll("[data-city]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const city = link.dataset.city;
    cityToggle.textContent = city;
    cityToggle.dataset.value = city;
    document.querySelectorAll("[data-city]").forEach((l) => l.classList.toggle("is-current", l === link));
    renderPopularCards(city);
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
// Rebuilt from real Zameen result pages fetched directly for this fix, not just the
// single 5-Marla example used before. Real data gathered (Lahore, With Material):
//   Complete:    3 Marla/1,215 sqft, 5 Marla/2,025 sqft, 10 Marla/3,375 sqft, 1 Kanal/6,300 sqft
//   Grey only:   3 Marla, 5 Marla, 10 Marla (same sqft figures)
//   Plus Karachi and Islamabad at 5 Marla Complete, for city multipliers.
// Key finding: per-sq-ft cost is NOT constant across sizes (smaller houses cost more per
// sq ft), so rates are now interpolated across real size anchor points instead of a single
// flat number. Labour, by contrast, IS a near-constant rate regardless of size (~495/sqft
// Complete, ~481/sqft Grey Structure, both With Material) — confirmed across all 4 sizes.

const MARLA_PER_KANAL = 20;

// Real (marla, sq ft) anchor points, from Zameen's own Popular Calculations cards
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

// Generic piecewise-linear interpolation across a sorted (x, y) table; holds the
// nearest known ratio steady for inputs outside the table instead of guessing beyond it.
const interpolate = (x, table, xKey, yKey) => {
  if (x <= table[0][xKey]) return (x / table[0][xKey]) * table[0][yKey];
  const last = table[table.length - 1];
  if (x >= last[xKey]) return (x / last[xKey]) * last[yKey];
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (x >= a[xKey] && x <= b[xKey]) {
      const t = (x - a[xKey]) / (b[xKey] - a[xKey]);
      return a[yKey] + t * (b[yKey] - a[yKey]);
    }
  }
};

const marlaToCoveredSqft = (marla) => interpolate(marla, COVERED_AREA_TABLE, "marla", "sqft");

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

// Real Price-per-Sq-Ft rates, provided directly (Rs/sqft, by city and Marla size).
// Two combinations were directly measured: Complete construction pairs with Without
// Material, Grey Structure pairs with With Material. The other two combinations
// (Complete+With, Grey+Without) are estimated using the ratio derived from the one
// available With-vs-Without comparison point (Rs 10.02L vs Rs 8.67L labour on the same
// 5 Marla house): With Material runs about 15.57% higher than Without Material.
const PRICE_PER_SQFT_COMPLETE_WITHOUT_MATERIAL = {
  Lahore: { 3: 5324, 4: 4962, 5: 4621, 6: 4596, 7: 4411, 8: 4488, 10: 4456, 20: 4404 },
  Karachi: { 3: 5370, 4: 4998, 5: 4649, 6: 4623, 7: 4433, 8: 4510, 10: 4475, 20: 4412 },
  Islamabad: { 3: 5196, 4: 4833, 5: 4490, 6: 4466, 7: 4280, 8: 4353, 10: 4320, 20: 4256 },
};
const PRICE_PER_SQFT_GREY_WITH_MATERIAL = {
  Lahore: { 3: 3001, 4: 2983, 5: 2852, 6: 2896, 7: 2814, 8: 2895, 10: 2848, 20: 2956 },
  Karachi: { 3: 3004, 4: 2987, 5: 2855, 6: 2900, 7: 2817, 8: 2896, 10: 2849, 20: 2954 },
  Islamabad: { 3: 2864, 4: 2848, 5: 2715, 6: 2760, 7: 2677, 8: 2754, 10: 2706, 20: 2804 },
};
const WITH_VS_WITHOUT_RATIO = 1.1557; // With Material averages ~15.57% higher

// Build a {sqft, rate} interpolation table for a given city + type + mode, using the
// same Marla anchor points as COVERED_AREA_TABLE so both tables line up exactly.
const buildRateTable = (city, constructionType, constructionMode) => {
  const baseTable = constructionType === "complete"
    ? PRICE_PER_SQFT_COMPLETE_WITHOUT_MATERIAL[city]
    : PRICE_PER_SQFT_GREY_WITH_MATERIAL[city];
  const isEstimated = (constructionType === "complete" && constructionMode === "with")
    || (constructionType === "grey" && constructionMode === "without");
  const shift = constructionType === "complete" ? WITH_VS_WITHOUT_RATIO : (1 / WITH_VS_WITHOUT_RATIO);

  return COVERED_AREA_TABLE
    .filter((point) => point.marla in baseTable)
    .map((point) => ({
      sqft: point.sqft,
      rate: isEstimated ? baseTable[point.marla] * shift : baseTable[point.marla],
    }));
};

// Cost-bucket proportions used only to split the blended rate above into the 4 display
// lines (Grey Material / Finishing Material / Labour). Derived from the one real
// Without-Material breakdown available (5 Marla Lahore: Grey 48.01L / Finish 36.89L /
// Labour 8.67L of 93.57L total) for Complete, and the one real Grey Structure breakdown
// (5 Marla Lahore: Grey 41.96L / Labour 9.74L of 51.70L total) for Grey Structure only.
// Applied as a constant proportion at every size/city/mode — an approximation, since the
// new rate data given is a single blended number with no material/labour split of its own.
const SPLIT_RATIOS = {
  complete: { greyMaterial: 0.5131, finishMaterial: 0.3943, labour: 0.0927 },
  grey: { greyMaterial: 0.8116, labour: 0.1884 },
};

// ===================== AREA SIZE RANGE VALIDATION =====================
// Real site shows "Valid range is 3 Marla - 1999 Marla" for the Marla unit; the same
// underlying 3-1999 Marla range is converted into the equivalent bounds for every
// other unit so the validation stays consistent no matter which unit is selected.
const MARLA_RANGE = { min: 3, max: 1999 };

const getAreaRangeForUnit = (unit) => {
  if (unit === "Marla") return MARLA_RANGE;
  if (unit === "Kanal") {
    return { min: MARLA_RANGE.min / MARLA_PER_KANAL, max: MARLA_RANGE.max / MARLA_PER_KANAL };
  }
  const sqftMin = marlaToCoveredSqft(MARLA_RANGE.min);
  const sqftMax = marlaToCoveredSqft(MARLA_RANGE.max);
  switch (unit) {
    case "Square Yards":
      return { min: sqftMin / 9, max: sqftMax / 9 };
    case "Square Meters":
      return { min: sqftMin / 10.764, max: sqftMax / 10.764 };
    case "Acre":
      return { min: sqftMin / 43560, max: sqftMax / 43560 };
    case "Square Feet":
    default:
      return { min: sqftMin, max: sqftMax };
  }
};

const formatRangeNumber = (n) => (Number.isInteger(n) ? n : Math.round(n * 100) / 100);

const areaSizeInputEl = document.getElementById("areaSize");
const areaSizeError = document.getElementById("areaSizeError");

const validateAreaSize = () => {
  if (!areaSizeInputEl || !areaSizeError) return true;
  const unit = unitToggle.dataset.value || "Marla";
  const value = Number(areaSizeInputEl.value);
  const range = getAreaRangeForUnit(unit);

  if (!areaSizeInputEl.value || value < range.min || value > range.max) {
    areaSizeError.textContent = `Valid range is ${formatRangeNumber(range.min)} ${unit} - ${formatRangeNumber(range.max)} ${unit}`;
    areaSizeError.classList.remove("is-hidden");
    return false;
  }

  areaSizeError.classList.add("is-hidden");
  return true;
};

if (areaSizeInputEl) {
  areaSizeInputEl.addEventListener("input", validateAreaSize);
}
document.querySelectorAll("[data-unit]").forEach((link) => {
  link.addEventListener("click", () => {
    if (areaSizeInputEl && areaSizeInputEl.value) validateAreaSize();
  });
});


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
    const areaSizeValue = Number(document.getElementById("areaSize").value);
    const coveredAreaInput = Number(document.getElementById("coveredArea").value);

    // Block calculation if Area Size is outside the valid range for its unit
    // (only applies when the person actually typed an Area Size; a direct
    // Covered Area entry bypasses Area Size entirely).
    if (coveredAreaInput <= 0 && !validateAreaSize()) {
      return;
    }

    // Use covered area if the person typed one directly, otherwise derive it from area size + unit
    const coveredArea = coveredAreaInput > 0
      ? coveredAreaInput
      : toSquareFeet(areaSizeValue > 0 ? areaSizeValue : 5, unit);

    const constructionType = calcBox.querySelector("#constructionTypeField .pill-btn.is-active").dataset.value; // "grey" or "complete"
    const constructionMode = calcBox.querySelector("#constructionModeField .pill-btn.is-active").dataset.value; // "with" or "without"

    const rateTable = buildRateTable(city, constructionType, constructionMode);
    const blendedRate = interpolate(coveredArea, rateTable, "sqft", "rate");
    const splitRatios = SPLIT_RATIOS[constructionType];

    const totalCost = coveredArea * blendedRate;
    const greyMaterialCost = totalCost * splitRatios.greyMaterial;
    const labourCost = totalCost * splitRatios.labour;
    const finishMaterialCost = constructionType === "complete"
      ? totalCost * splitRatios.finishMaterial
      : 0;

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