/**
 * Pomocnicze funkcje dla DialogV2.
 */

/**
 * Treść dialogu jako zaufany <div>, aby DialogV2 nie czyścił stylów i atrybutów.
 * Używaj tylko dla HTML budowanego przez moduł (wartości od użytkownika escapuj osobno).
 * @param {string} html
 * @returns {HTMLDivElement}
 */
export function dialogContent(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
}

/**
 * Wartość pola z elementu dialogu DialogV2.
 * @param {DialogV2} dialog
 * @param {string} selector
 * @returns {string|undefined}
 */
export function dialogValue(dialog, selector) {
  return dialog.element.querySelector(selector)?.value;
}

/** Bezpieczne wstawienie tekstu do HTML. */
export function escapeHTML(value) {
  return Handlebars.escapeExpression(value ?? "");
}

/** Standardowy przycisk „Anuluj” dla DialogV2 (DialogV2 tłumaczy etykietę). */
export const CANCEL_BUTTON = Object.freeze({ action: "cancel", icon: "fas fa-times", label: "WFRP4E_COMPANION.Cancel" });
