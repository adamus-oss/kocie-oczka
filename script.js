// ============================================================
//  Kocie Oczka — script.js
//  Sklep szydełkowy Basi 🧶
// ============================================================

// ── Stałe ────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "48517729251";

const CATEGORY_LABELS = {
  opaski: "Opaska 🎀",
  kominy: "Komin 🌀",
  topy:   "Top ✨",
  inne:   "Inne 🌟",
};

const CATEGORY_EMOJI = {
  opaski: "🎀",
  kominy: "🌀",
  topy:   "✨",
  inne:   "🌟",
};

// ── DOMContentLoaded ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initSmoothScroll();
  initWhatsAppButtons();
  fetchProducts();
});

// ── Pobieranie i renderowanie produktów ──────────────────────

async function fetchProducts() {
  const grid = document.getElementById("products-grid");

  if (!grid) {
    console.warn("Brak elementu #products-grid w DOM.");
    return;
  }

  try {
    const response = await fetch("/products.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    if (products.length === 0) {
      grid.innerHTML = '<p class="grid-message">Brak produktów do wyświetlenia. 🧶</p>';
      return;
    }

    renderProducts(products, grid);
    initFilters(products);

  } catch (error) {
    console.error("Błąd pobierania produktów:", error);
    grid.innerHTML = '<p class="grid-message grid-error">Coś poszło nie tak... 😿 Odśwież stronę!</p>';
  }
}

// ── Budowanie HTML karty produktu ────────────────────────────

function buildProductCard(product) {
  const {
    id          = "",
    name        = "Bez nazwy",
    category    = "",
    description = "",
    price       = "?",
    image       = "",
    available   = true,
    emoji       = CATEGORY_EMOJI[category] || "🧶",
  } = product;

  const categoryLabel = CATEGORY_LABELS[category] || category;
  const whatsappText  = encodeURIComponent(
    `Hej Basiu! 👋 Chcę zamówić: ${name}. Czy jest dostępne? 🧶`
  );
  const whatsappUrl   = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

  // Przycisk — niedostępny lub aktywny
  const btnHtml = available
    ? `<a href="${whatsappUrl}" class="btn-order" target="_blank" rel="noopener">Zamów 💬</a>`
    : `<button class="btn-order btn-disabled" disabled>Niedostępny 😔</button>`;

  // Bezpieczny atrybut src — jeśli puste, od razu brak obrazka
  const imgHtml = image
    ? `<img src="${image}" alt="${escapeHtml(name)}" loading="lazy"
          onerror="this.parentElement.classList.add('no-image'); this.remove()">`
    : "";

  const article = document.createElement("article");
  article.className = `product-card${available ? "" : " unavailable"}`;
  article.dataset.category = category;

  // Jeśli nie ma ścieżki obrazka — od razu dodaj klasę no-image
  if (!image) {
    article.querySelector && void 0; // placeholder; klasa ustawiana niżej
  }

  article.innerHTML = `
    <div class="product-image-wrap${image ? "" : " no-image"}">
      ${imgHtml}
      <div class="product-emoji-placeholder">${emoji}</div>
      <span class="category-badge">${categoryLabel}</span>
    </div>
    <div class="product-info">
      <h3 class="product-name">${escapeHtml(name)}</h3>
      <p class="product-desc">${escapeHtml(description)}</p>
      <div class="product-footer">
        <span class="product-price">${escapeHtml(price)}</span>
        ${btnHtml}
      </div>
    </div>
  `;

  return article;
}

// ── Renderowanie listy produktów ─────────────────────────────

function renderProducts(products, grid) {
  grid.innerHTML = "";

  products.forEach((product) => {
    const card = buildProductCard(product);
    grid.appendChild(card);
  });
}

// ── Filtry ───────────────────────────────────────────────────

function initFilters(products) {
  const filterButtons = document.querySelectorAll("[data-filter]");

  if (!filterButtons.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Aktywny przycisk
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.dataset.filter;
      applyFilter(filterValue);
    });
  });
}

function applyFilter(filterValue) {
  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card) => {
    const matches =
      filterValue === "all" || card.dataset.category === filterValue;

    if (matches) {
      // Usuń klasę hidden — karta pojawia się (CSS transition)
      card.classList.remove("hidden");
    } else {
      // Dodaj klasę hidden — karta znika
      card.classList.add("hidden");
    }
  });
}

// ── Nagłówek — efekt scroll ───────────────────────────────────

function initHeader() {
  const header = document.querySelector("header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // wywołaj od razu przy załadowaniu
}

// ── Mobilna nawigacja ────────────────────────────────────────

/**
 * Przełącza mobilne menu nawigacyjne.
 * Wywoływana z atrybutu onclick="toggleNav()" w HTML.
 */
function toggleNav() {
  const header = document.querySelector("header");
  if (!header) return;
  header.classList.toggle("nav-open");
}

// Eksport dla onclick w HTML (nie moduł ES)
window.toggleNav = toggleNav;

// ── Smooth scroll dla linków kotwicowych ─────────────────────

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      // Zamknij mobilne menu jeśli otwarte
      const header = document.querySelector("header");
      if (header) header.classList.remove("nav-open");

      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ── Inicjalizacja stałych przycisków WhatsApp ────────────────

function initWhatsAppButtons() {
  const ctaMsg   = "Hej Basiu! 👋 Chcę zamówić wyrób 🧶 Czy możesz mi powiedzieć co jest dostępne?";
  const floatMsg = "Hej Basiu! 👋 Chciałam zapytać o wyroby 🧶";
  const ctaUrl   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(ctaMsg)}`;
  const floatUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(floatMsg)}`;

  const ctaBtn   = document.getElementById("cta-whatsapp");
  const floatBtn = document.getElementById("float-whatsapp");

  if (ctaBtn)   ctaBtn.href   = ctaUrl;
  if (floatBtn) floatBtn.href = floatUrl;
}

// ── Pomocnicze ───────────────────────────────────────────────

/**
 * Escapuje znaki specjalne HTML, by zapobiec XSS przy wstawianiu treści CMS.
 */
function escapeHtml(str) {
  if (typeof str !== "string") return String(str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
