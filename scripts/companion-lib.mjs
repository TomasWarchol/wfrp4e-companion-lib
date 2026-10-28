/**
 * WFRP4e Companion Library – wspólny kod modułów Old World Alchemy, Iron Mandate i Underworld Crew.
 *
 * Moduły serii importują ją bezpośrednio:
 *   import { registry, registerSheetButton } from "../wfrp4e-companion-lib/scripts/companion-lib.mjs";
 * Makra i inne moduły mogą użyć: game.modules.get("wfrp4e-companion-lib").api
 */

import { LIB_ID, t } from "./constants.mjs";
import { registry, FeatureRegistry, GMHubApp } from "./gm-hub.mjs";
import { registerSheetButton } from "./sheet-buttons.mjs";
import { addTokenTool } from "./scene-tools.mjs";
import { dialogContent, dialogValue, escapeHTML, CANCEL_BUTTON } from "./dialogs.mjs";
import * as time from "./time.mjs";
import { registerQuery, queryGM, notifyUsers } from "./queries.mjs";
import { registerHandlebarsHelpers } from "./handlebars-helpers.mjs";

export {
  LIB_ID,
  registry,
  FeatureRegistry,
  GMHubApp,
  registerSheetButton,
  addTokenTool,
  dialogContent,
  dialogValue,
  escapeHTML,
  CANCEL_BUTTON,
  time,
  registerQuery,
  queryGM,
  notifyUsers
};

const api = {
  registry,
  registerSheetButton,
  addTokenTool,
  dialog: { dialogContent, dialogValue, escapeHTML, CANCEL_BUTTON },
  time,
  registerQuery,
  queryGM,
  notifyUsers,
  openHub: () => registry.openHub()
};

Hooks.once("init", () => {
  game.modules.get(LIB_ID).api = api;
  // Zgodność wsteczna: makra i starsze wersje modułów używają game.wfrp4eHub
  game.wfrp4eHub = registry;

  registerHandlebarsHelpers();
  foundry.applications.handlebars.loadTemplates([`modules/${LIB_ID}/templates/gm-hub.hbs`]);
});

Hooks.once("ready", () => {
  // Pozwolenie innym modułom na rejestrację w Centrum Dodatków
  Hooks.callAll("wfrp4eHubRegisterFeatures", registry);
});

/* -------------------------------------------- */
/*  Komendy na czacie                           */
/* -------------------------------------------- */

Hooks.on("chatMessage", (chatLog, message) => {
  const clean = message.trim().toLowerCase();
  if (["/hub", "/gm", "/mg", "/bajery", "/dodatki"].includes(clean)) {
    registry.openHub();
    return false;
  }
});

/* -------------------------------------------- */
/*  Przycisk Centrum MG w katalogu Aktorów      */
/* -------------------------------------------- */

Hooks.on("renderActorDirectory", (app, html) => {
  if (!game.user.isGM) return;
  const root = html instanceof HTMLElement ? html : (html?.[0] || app.element);
  if (!(root instanceof HTMLElement) || root.querySelector(".open-gm-hub-btn")) return;

  const header = root.querySelector(".header-actions") || root.querySelector(".directory-header");
  if (!header) return;

  const gmBtn = document.createElement("button");
  gmBtn.type = "button";
  gmBtn.className = "open-gm-hub-btn";
  gmBtn.innerHTML = `<i class="fas fa-sliders-h"></i> ${t("Hub.ActorDirectoryButton")}`;
  gmBtn.title = t("Hub.ActorDirectoryTooltip");
  gmBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    registry.openHub();
  });
  header.appendChild(gmBtn);
});
