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
  const waIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

  const btnHtml = available
    ? `<a href="${whatsappUrl}" class="btn-order" target="_blank" rel="noopener">${waIcon} Zamów</a>`
    : `<button class="btn-order btn-disabled" disabled>Niedostępny 😔</button>`;

  // Bezpieczny atrybut src — jeśli puste, od razu brak obrazka
  const imgHtml = image
    ? `<img src="${image}" alt="${escapeHtml(name)}" loading="lazy"
          onerror="this.parentElement.classList.add('no-image'); this.remove()">`
    : "";

  const article = document.createElement("article");
  article.className = `product-card${available ? "" : " unavailable"}`;
  article.dataset.category = category;

  article.innerHTML = `
    <div class="product-image-wrap${image ? "" : " no-image"}">
      ${imgHtml}
      <div class="product-emoji-placeholder">${emoji}</div>
      <span class="category-badge badge-${category}">${categoryLabel}</span>
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
