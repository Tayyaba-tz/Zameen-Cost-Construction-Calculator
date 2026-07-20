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

// Per-sq-ft rate anchor points (Rs/sqft), Lahore, With Material — real data, not estimated
const GREY_RATE_TABLE_COMPLETE = [
  { sqft: 1215, rate: 2220.6 },
  { sqft: 2025, rate: 2323.5 },
  { sqft: 3375, rate: 2055.7 },
  { sqft: 6300, rate: 2142.9 },
];
const FINISH_RATE_TABLE = [
  { sqft: 1215, rate: 2376.1 },
  { sqft: 2025, rate: 1821.7 },
  { sqft: 3375, rate: 1661.9 },
  { sqft: 6300, rate: 1500.3 },
];
const GREY_RATE_TABLE_ONLY = [
  { sqft: 1215, rate: 2519.3 },
  { sqft: 2025, rate: 2072.1 },
  { sqft: 3375, rate: 2055.7 },
];

// Labour is a near-flat rate regardless of size (confirmed 494.7–495.1 across all 4
// Complete data points, 480.7–481.0 across all 3 Grey Structure data points)
const LABOUR_RATE = {
  complete: { with: 495, without: 428 },
  grey: { with: 481, without: 416 }, // "without" for Grey Structure is estimated (no verified data point)
};

const CITY_MULTIPLIER = {
  Lahore: { grey: 1.0, finish: 1.0, labour: 1.0 },
  Karachi: { grey: 1.0125, finish: 1.0141, labour: 1.0429 },
  Islamabad: { grey: 0.9530, finish: 1.0033, labour: 1.0409 },
};

const WITHOUT_MATERIAL_SHIFT = { grey: 1.0204, finish: 1.0 };

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
    const areaSizeInput = Number(document.getElementById("areaSize").value);
    const coveredAreaInput = Number(document.getElementById("coveredArea").value);

    // Use covered area if the person typed one directly, otherwise derive it from area size + unit
    const coveredArea = coveredAreaInput > 0
      ? coveredAreaInput
      : toSquareFeet(areaSizeInput > 0 ? areaSizeInput : 5, unit);

    const constructionType = calcBox.querySelector("#constructionTypeField .pill-btn.is-active").dataset.value; // "grey" or "complete"
    const constructionMode = calcBox.querySelector("#constructionModeField .pill-btn.is-active").dataset.value; // "with" or "without"

    const cityMult = CITY_MULTIPLIER[city] || CITY_MULTIPLIER.Lahore;

    // Interpolate the size-dependent grey/finish rates for this exact covered area
    let greyRate = constructionType === "complete"
      ? interpolate(coveredArea, GREY_RATE_TABLE_COMPLETE, "sqft", "rate")
      : interpolate(coveredArea, GREY_RATE_TABLE_ONLY, "sqft", "rate");
    let finishRate = interpolate(coveredArea, FINISH_RATE_TABLE, "sqft", "rate");

    // Apply the Without-Material shift (estimated to carry over from the one verified
    // data point at every size, since per-size without-material data isn't available)
    if (constructionMode === "without") {
      greyRate *= WITHOUT_MATERIAL_SHIFT.grey;
      finishRate *= WITHOUT_MATERIAL_SHIFT.finish;
    }

    const labourRate = LABOUR_RATE[constructionType][constructionMode];

    const greyMaterialCost = coveredArea * greyRate * cityMult.grey;
    const labourCost = coveredArea * labourRate * cityMult.labour;
    const finishMaterialCost = constructionType === "complete"
      ? coveredArea * finishRate * cityMult.finish
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
const MOBILE_BREAKPOINT = 768;

window.addEventListener("resize", () => {
  if (window.innerWidth > MOBILE_BREAKPOINT && mobileMenu.classList.contains("is-open")) {
    mobileMenu.classList.remove("is-open");
    hamburgerBtn.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
  }
});