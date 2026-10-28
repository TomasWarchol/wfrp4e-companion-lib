/** Identyfikator modułu biblioteki. */
export const LIB_ID = "wfrp4e-companion-lib";

/** Przestrzeń kluczy tłumaczeń biblioteki. */
export const I18N = "WFRP4E_COMPANION";

/** Tłumaczy klucz z przestrzeni biblioteki (z podstawieniami, gdy podano dane). */
export function t(key, data) {
  const full = `${I18N}.${key}`;
  return data ? game.i18n.format(full, data) : game.i18n.localize(full);
}
