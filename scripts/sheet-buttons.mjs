/**
 * Przyciski modułów serii na kartach postaci WFRP4e.
 * Przycisk widać tylko wtedy, gdy MG odblokował daną funkcję dla postaci w GM Hubie.
 */

import { registry } from "./gm-hub.mjs";

/** @type {Map<string, SheetButtonConfig>} */
const buttons = new Map();

/**
 * @typedef SheetButtonConfig
 * @property {string} featureId      Identyfikator funkcji w GM Hubie (np. "alchemy")
 * @property {string} className      Klasa CSS przycisku w nagłówku karty
 * @property {string} icon           Klasy ikony Font Awesome (np. "fa-solid fa-flask")
 * @property {string} label          Etykieta / tooltip (może być kluczem lokalizacji)
 * @property {string} action         Identyfikator akcji w menu nagłówka ApplicationV2
 * @property {(actor: Actor, sheet: object) => void} onClick
 * @property {string[]} [legacyClasses]  Klasy starych zakładek modułu, zawsze usuwane z karty
 */

/**
 * Rejestruje przycisk modułu na kartach postaci.
 * @param {SheetButtonConfig} config
 */
export function registerSheetButton(config) {
  buttons.set(config.featureId, config);
}

/** Czy dany użytkownik widzi przycisk funkcji na karcie tej postaci. */
function isVisibleFor(actor, featureId) {
  if (!actor || actor.type !== "character") return false;
  if (!game.user.isGM && !actor.isOwner) return false;
  return registry.isFeatureUnlocked(actor, featureId);
}

function injectButtons(sheet, element) {
  const actor = sheet.actor;
  if (!actor || actor.type !== "character") return;

  const root = element instanceof HTMLElement ? element : (element?.[0] || sheet.element?.[0] || sheet.element);
  if (!(root instanceof HTMLElement)) return;
  const windowHeader = root.querySelector(".window-header");

  for (const config of buttons.values()) {
    // Dostęp do modułów jest wyłącznie przez ikonę w nagłówku okna, nie przez zakładki karty
    for (const cls of config.legacyClasses ?? []) root.querySelector(`.${cls}`)?.remove();

    if (!isVisibleFor(actor, config.featureId)) {
      root.querySelector(`.${config.className}`)?.remove();
      continue;
    }
    if (!windowHeader || windowHeader.querySelector(`.${config.className}`)) continue;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `header-control icon ${config.icon} ${config.className}`;
    const tooltip = game.i18n.localize(config.label);
    btn.dataset.tooltip = tooltip;
    btn.setAttribute("aria-label", tooltip);
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      config.onClick(actor, sheet);
    });

    const closeBtn = windowHeader.querySelector('[data-action="close"]') || windowHeader.querySelector(".close");
    if (closeBtn) windowHeader.insertBefore(btn, closeBtn);
    else windowHeader.appendChild(btn);
  }
}

// Karty ApplicationV2 (WFRP4e 9+) – hook wywoływany dla każdej klasy w hierarchii, wystarczy bazowa
Hooks.on("renderActorSheetV2", (sheet, element) => injectButtons(sheet, element));
// Karty starego typu (np. inne moduły kart)
Hooks.on("renderActorSheet", (sheet, html) => injectButtons(sheet, html));

// Menu nagłówka ApplicationV2 (3 kropki)
Hooks.on("getHeaderControlsActorSheetV2", (sheet, controls) => {
  for (const config of buttons.values()) {
    if (!isVisibleFor(sheet.actor, config.featureId)) continue;
    if (controls.some(c => c.action === config.action)) continue;
    controls.push({
      action: config.action,
      icon: config.icon,
      label: config.label,
      ownership: "OWNER",
      onClick: () => config.onClick(sheet.actor, sheet)
    });
  }
});

// Przyciski nagłówka kart starego typu
Hooks.on("getActorSheetHeaderButtons", (sheet, headerButtons) => {
  for (const config of buttons.values()) {
    if (!isVisibleFor(sheet.actor, config.featureId)) continue;
    if (headerButtons.some(b => b.class === config.className)) continue;
    headerButtons.unshift({
      label: game.i18n.localize(config.label),
      class: config.className,
      icon: config.icon,
      onclick: () => config.onClick(sheet.actor, sheet)
    });
  }
});
