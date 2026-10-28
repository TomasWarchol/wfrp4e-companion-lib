/**
 * Narzędzia modułów serii na pasku tokenów (Scene Controls, Foundry v13+).
 */

import { registry } from "./gm-hub.mjs";

/** @type {Map<string, object>} */
const tools = new Map();

/**
 * Rejestruje przycisk na pasku narzędzi tokenów.
 * @param {object} config
 * @param {string} config.name      Unikalna nazwa narzędzia
 * @param {string} config.title     Tytuł / tooltip
 * @param {string} config.icon      Klasy ikony Font Awesome
 * @param {Function} config.onClick Wywoływane po kliknięciu
 * @param {boolean} [config.gmOnly=true]
 */
export function addTokenTool(config) {
  tools.set(config.name, { gmOnly: true, ...config });
}

/** Zwraca rekord narzędzi grupy tokenów z hooka getSceneControlButtons. */
function findTokenTools(controls) {
  const tokenControls = controls?.tokens ?? controls?.token
    ?? Object.values(controls ?? {}).find(c => c?.name === "token" || c?.name === "tokens");
  return tokenControls?.tools ?? null;
}

// Centrum Dodatków MG jest zawsze dostępne dla MG
addTokenTool({
  name: "wfrp4e-gm-hub",
  title: "WFRP4E_COMPANION.Hub.SceneTool",
  icon: "fas fa-sliders-h",
  onClick: () => registry.openHub()
});

Hooks.on("getSceneControlButtons", (controls) => {
  const tokenTools = findTokenTools(controls);
  if (!tokenTools) return;
  for (const tool of tools.values()) {
    if (tool.gmOnly && !game.user.isGM) continue;
    if (tokenTools[tool.name]) continue;
    tokenTools[tool.name] = {
      name: tool.name,
      title: game.i18n.localize(tool.title),
      icon: tool.icon,
      visible: true,
      order: Object.keys(tokenTools).length,
      button: true,
      onChange: () => tool.onClick()
    };
  }
});
