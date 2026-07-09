// Shared init: entrance/scroll animations + (on the showcase page) search & category filtering.
document.addEventListener("DOMContentLoaded", () => {
  if (window.AOS) {
    AOS.init({ duration: 650, easing: "ease-out-cubic", once: true, offset: 40 });
  }

  const heroTargets = document.querySelectorAll(".hero-eyebrow, .hero-title, .hero-lede, .hero-cta, .hero-note");
  if (window.gsap && heroTargets.length) {
    gsap.from(heroTargets, {
      y: 18,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "power2.out",
    });
  }

  const grid = document.querySelector("[data-app-grid]");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll("[data-app-card]"));
  const searchInput = document.querySelector("[data-search]");
  const chips = Array.from(document.querySelectorAll("[data-chip]"));
  const noResults = document.querySelector("[data-no-results]");
  let activeCategory = "all";

  function applyFilters() {
    const term = (searchInput?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const category = card.dataset.category || "";
      const haystack = card.dataset.search || card.textContent.toLowerCase();
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const matchesTerm = !term || haystack.toLowerCase().includes(term);
      const visible = matchesCategory && matchesTerm;
      card.style.display = visible ? "" : "none";
      if (visible) visibleCount++;
    });

    if (noResults) {
      noResults.classList.toggle("show", visibleCount === 0);
    }
  }

  searchInput?.addEventListener("input", applyFilters);

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeCategory = chip.dataset.chip;
      applyFilters();
    });
  });

  applyFilters();
});
