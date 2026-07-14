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
// Formulas below are reverse-engineered from real Zameen result pages (see project
// notes / uploaded formula analysis). Verified baseline is Lahore, Standard grade,
// 5 Marla / 2,025 sq ft, "With Material":
//   Complete:       Total = Rs 4,640 / sq ft  (Grey Material 50.09% / Finishing 39.27% / Labour 10.66%)
//   Grey Structure: Total = Rs 2,553 / sq ft  (Grey Material 81.16% / Labour 18.84%)
// City and Construction Mode multipliers below are estimated, Zameen does not
// publish city-specific or mode-specific rate tables, so only the Lahore /
// With-Material baseline above is directly checked against real output.

const SQFT_PER_MARLA = 225;
const MARLA_PER_KANAL = 20;

const CITY_MULTIPLIER = {
  Lahore: 1.0,
  Karachi: 1.08,
  Islamabad: 1.12,
};

const MODE_MULTIPLIER = {
  with: 1.0, // verified baseline assumes the contractor supplies material
  without: 0.55, // inference only: material cost mostly stripped out, labour-heavy rate remains
};

// Verified per-sq-ft baseline rates (Lahore, With Material, Standard grade)
const RATE_PER_SQFT = {
  complete: 4621,
  grey: 2553,
};

// Verified cost-split ratios, derived directly from the doc's two worked examples
// (47.05 / 36.89 / 10.02 / 93.96 for Complete, 41.96 / 9.74 / 51.70 for Grey Structure)
const SPLIT_RATIOS = {
  complete: { greyMaterial: 0.5007, finishMaterial: 0.3926, labour: 0.1066 },
  grey: { greyMaterial: 0.8116, labour: 0.1884 },
};

const toSquareFeet = (size, unit) => {
  switch (unit) {
    case "Marla":
      return size * SQFT_PER_MARLA;
    case "Kanal":
      return size * MARLA_PER_KANAL * SQFT_PER_MARLA;
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

const formatCurrency = (amount) => "Rs " + Math.round(amount).toLocaleString("en-PK");

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
    const modeMultiplier = MODE_MULTIPLIER[constructionMode] || 1;

    const baseRatePerSqft = RATE_PER_SQFT[constructionType];
    const splitRatios = SPLIT_RATIOS[constructionType];

    // Formula 1: Total Cost = (rate per sq ft, adjusted for city and construction mode) x Covered Area
    const totalCost = coveredArea * baseRatePerSqft * cityMultiplier * modeMultiplier;

    const greyMaterialCost = totalCost * splitRatios.greyMaterial;
    const labourCost = totalCost * splitRatios.labour;
    const finishMaterialCost = constructionType === "complete" ? totalCost * splitRatios.finishMaterial : 0;

    // Formula 2: Price per Sq. Ft. = Total Cost / Covered Area
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