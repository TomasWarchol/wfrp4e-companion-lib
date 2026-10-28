/**
 * WFRP4e - Centrum Zarządzania Dodatkami dla MG (GM Hub)
 * Rejestr modułów i uprawnień per-postać (domyślnie ukryte)
 */

import { LIB_ID, t } from "./constants.mjs";

const GM_HUB_APP_ID = "wfrp4e-gm-hub-app";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class FeatureRegistry {
  constructor() {
    this.features = new Map();
    this._registerDefaults();
  }

  /**
   * Pre-definiuje standardowe moduły serii, aby były widoczne w hubie
   * nawet jeśli dany moduł jest w danym świecie wyłączony lub jeszcze się nie załadował.
   */
  _registerDefaults() {
    // Nazwy i opisy to klucze tłumaczeń – tłumaczone przy wyświetlaniu (getFeatures)
    this.registerFeature({
      id: "underworld",
      name: "WFRP4E_COMPANION.Features.Underworld",
      icon: "fas fa-skull-crossbones",
      description: "WFRP4E_COMPANION.Features.UnderworldDesc",
      module: "wfrp4e-underworld",
      open: () => ui.notifications?.warn(t("Features.UnderworldInactive"))
    });

    this.registerFeature({
      id: "alchemy",
      name: "WFRP4E_COMPANION.Features.Alchemy",
      icon: "fas fa-flask",
      description: "WFRP4E_COMPANION.Features.AlchemyDesc",
      module: "wfrp4e-alchemy",
      open: () => ui.notifications?.warn(t("Features.AlchemyInactive"))
    });

    this.registerFeature({
      id: "champion",
      name: "WFRP4E_COMPANION.Features.Champion",
      icon: "fas fa-shield-halved",
      description: "WFRP4E_COMPANION.Features.ChampionDesc",
      module: "wfrp4e-champion",
      open: () => ui.notifications?.warn(t("Features.ChampionInactive"))
    });
  }

  /**
   * Rejestruje lub aktualizuje moduł / bajer
   */
  registerFeature(config) {
    if (!config || !config.id) {
      console.warn(`${LIB_ID} | ${t("Hub.InvalidFeature")}`, config);
      return;
    }
    const existing = this.features.get(config.id) || {};
    this.features.set(config.id, {
      id: config.id,
      name: config.name || existing.name || config.id,
      icon: config.icon || existing.icon || "fas fa-cube",
      description: config.description || existing.description || "",
      module: config.module || existing.module || null,
      isAvailable: typeof config.isAvailable === "function" ? config.isAvailable : (existing.isAvailable || (() => true)),
      open: typeof config.open === "function" ? config.open : existing.open
    });
  }

  /**
   * Zwraca listę wszystkich zarejestrowanych funkcji ze statusem instalacji
   */
  getFeatures() {
    return Array.from(this.features.values()).map(f => {
      const isActive = f.module ? !!game.modules.get(f.module)?.active : true;
      return {
        ...f,
        name: game.i18n.localize(f.name),
        description: game.i18n.localize(f.description),
        isInstalled: isActive && (typeof f.isAvailable === "function" ? f.isAvailable() : true)
      };
    });
  }

  /**
   * Sprawdza czy dana funkcja jest odblokowana dla konkretnego aktora
   * Domyślnie: FALSE (ukryte)
   */
  isFeatureUnlocked(actor, featureId) {
    if (!actor) return false;
    // Bezpieczny odczyt z actor.flags bez getFlag dla nieistniejących modułów
    const flags = actor.flags || {};
    const worldList = flags.world?.unlockedFeatures || flags.world?.wfrp4e_unlocked_features;
    const legacyHubList = flags["wfrp4e-hub"]?.unlockedFeatures;
    const underworldList = flags["wfrp4e-underworld"]?.unlockedFeatures;
    const championList = flags["wfrp4e-champion"]?.unlockedFeatures;
    const alchemyList = flags["wfrp4e-alchemy"]?.unlockedFeatures;

    const list = Array.isArray(worldList) ? worldList
      : (Array.isArray(legacyHubList) ? legacyHubList
      : (Array.isArray(underworldList) ? underworldList : []));

    if (list.includes(featureId)) return true;

    // Wsparcie dla ewentualnych flag per-moduł
    if (featureId === "underworld" && (flags["wfrp4e-underworld"]?.unlocked === true || (Array.isArray(underworldList) && underworldList.includes("underworld")))) return true;
    if (featureId === "champion" && (flags["wfrp4e-champion"]?.unlocked === true || (Array.isArray(championList) && championList.includes("champion")))) return true;
    if (featureId === "alchemy" && (flags["wfrp4e-alchemy"]?.unlocked === true || (Array.isArray(alchemyList) && alchemyList.includes("alchemy")))) return true;

    return false;
  }

  /** Postacie dodane do panelu lub mające już jakąś funkcję. */
  getManagedActors(features = this.getFeatures()) {
    return game.actors.filter(actor => actor.type === "character" && (
      actor.flags?.world?.gmHubManaged === true
      || features.some(feature => this.isFeatureUnlocked(actor, feature.id))
    ));
  }

  async setActorManaged(actor) {
    if (!actor || actor.flags?.world?.gmHubManaged === true) return false;
    await actor.setFlag("world", "gmHubManaged", true);
    return true;
  }

  /** Włącza lub wyłącza jedną funkcję dla postaci. */
  async setFeatureUnlocked(actor, featureId, unlocked) {
    if (!actor) return;
    const flags = actor.flags || {};
    const worldList = flags.world?.unlockedFeatures || flags.world?.wfrp4e_unlocked_features;
    const legacyHubList = flags["wfrp4e-hub"]?.unlockedFeatures;
    const underworldList = flags["wfrp4e-underworld"]?.unlockedFeatures;
    const current = Array.isArray(worldList) ? worldList
      : (Array.isArray(legacyHubList) ? legacyHubList
      : (Array.isArray(underworldList) ? underworldList : []));
    let list = [...current];

    if (unlocked) {
      if (!list.includes(featureId)) list.push(featureId);
    } else {
      list = list.filter(id => id !== featureId);
    }

    // Kopie listy w flagach modułów zostają dla zgodności ze starszymi wersjami modułów
    const updates = { "flags.world.unlockedFeatures": list };
    if (game.modules.get("wfrp4e-underworld")?.active) {
      updates["flags.wfrp4e-underworld.unlockedFeatures"] = list;
    }
    if (game.modules.get("wfrp4e-champion")?.active) {
      updates["flags.wfrp4e-champion.unlockedFeatures"] = list;
    }
    if (game.modules.get("wfrp4e-alchemy")?.active) {
      updates["flags.wfrp4e-alchemy.unlockedFeatures"] = list;
      if (featureId === "alchemy") updates["flags.wfrp4e-alchemy.unlocked"] = Boolean(unlocked);
    }
    await actor.update(updates);
  }

  /**
   * Otwiera panel MG (singleton okna)
   */
  openHub() {
    if (!game.user.isGM) {
      ui.notifications.warn(t("Hub.GMOnly"));
      return;
    }
    const existing = foundry.applications.instances.get(GM_HUB_APP_ID);
    if (existing) {
      existing.render({ force: true });
      existing.bringToFront();
      return;
    }
    new GMHubApp().render({ force: true });
  }
}

/** Jedyna instancja rejestru, współdzielona przez wszystkie moduły serii. */
export const registry = new FeatureRegistry();

/**
 * Aplikacja okna panelu MG
 */
export class GMHubApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: GM_HUB_APP_ID,
    classes: ["wfrp4e", "gm-hub-window"],
    tag: "div",
    window: {
      title: "WFRP4E_COMPANION.Hub.WindowTitle",
      icon: "fas fa-sliders-h",
      resizable: true
    },
    position: {
      width: 780,
      height: 640
    },
    actions: {
      "open-feature": GMHubApp.#onOpenFeature,
      "enable-all-feature": GMHubApp.#onEnableAllFeature,
      "disable-all-feature": GMHubApp.#onDisableAllFeature
    }
  };

  static PARTS = {
    main: {
      template: `modules/${LIB_ID}/templates/gm-hub.hbs`
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const features = registry.getFeatures();

    // Pobierz wszystkie postacie
    const allCharacters = registry.getManagedActors(features)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Zbuduj wiersze matrycy
    const characterRows = allCharacters.map(char => {
      // Wykryj graczy będących właścicielami
      const owners = game.users
        .filter(u => !u.isGM && char.testUserPermission(u, "OWNER"))
        .map(u => u.name);

      const featureStates = features.map(f => ({
        id: f.id,
        name: f.name,
        icon: f.icon,
        isInstalled: f.isInstalled,
        isUnlocked: registry.isFeatureUnlocked(char, f.id)
      }));

      return {
        id: char.id,
        name: char.name,
        img: char.img || "icons/svg/mystery-man.svg",
        owners: owners.join(", ") || t("Hub.GMOnlyOwner"),
        hasPlayerOwner: owners.length > 0,
        features: featureStates
      };
    });

    context.features = features;
    context.characters = characterRows;
    context.totalCharacters = allCharacters.length;
    context.installedCount = features.filter(f => f.isInstalled).length;

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const html = this.element;

    // 1. Zmiana przełącznika danej funkcji dla aktora
    html.querySelectorAll(".feature-toggle-checkbox").forEach(checkbox => {
      checkbox.addEventListener("change", async () => {
        const actor = game.actors.get(checkbox.dataset.actorId);
        const featureId = checkbox.dataset.featureId;
        const isChecked = checkbox.checked;
        if (!actor) return;
        await registry.setFeatureUnlocked(actor, featureId, isChecked);
        const feature = registry.features.get(featureId);
        const name = feature?.name ? game.i18n.localize(feature.name) : featureId;
        ui.notifications.info(t(isChecked ? "Hub.Unlocked" : "Hub.Hidden", { feature: name, actor: actor.name }));
      });
    });

    const dropzone = html.querySelector(".gm-hub-dropzone");
    dropzone?.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = "copy";
    });
    dropzone?.addEventListener("drop", async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      let data;
      try { data = JSON.parse(ev.dataTransfer?.getData("text/plain") || "{}"); } catch (_) { data = {}; }
      if (data.type !== "Actor") return;

      const uuid = data.uuid || (data.id ? `Actor.${data.id}` : null);
      const actor = uuid ? await fromUuid(uuid) : null;
      if (!actor || actor.type !== "character") {
        ui.notifications.warn(t("Hub.DropCharacter"));
        return;
      }

      if (await registry.setActorManaged(actor)) this.render();
    });

    // 4. Filtrowanie postaci po tekście
    html.querySelector("#gm-hub-search")?.addEventListener("input", (ev) => {
      const query = ev.currentTarget.value.trim().toLowerCase();
      html.querySelectorAll(".gm-hub-row").forEach(row => {
        const name = (row.dataset.actorName || "").toLowerCase();
        const owner = (row.dataset.actorOwner || "").toLowerCase();
        row.hidden = !!query && !name.includes(query) && !owner.includes(query);
      });
    });
  }

  // 2. Bezpośrednie otwarcie panelu bajeru z poziomu MG
  static #onOpenFeature(event, target) {
    event.preventDefault();
    const actor = game.actors.get(target.dataset.actorId);
    const featureId = target.dataset.featureId;
    const feature = registry.features.get(featureId);

    if (feature && typeof feature.open === "function") {
      feature.open(actor);
    } else {
      ui.notifications.warn(t("Hub.NoOpenFunction", { feature: featureId }));
    }
  }

  // 3. Masowe włączanie / wyłączanie
  static async #onEnableAllFeature(event, target) {
    event.preventDefault();
    const featureId = target.dataset.featureId;
    for (const char of registry.getManagedActors()) {
      await registry.setFeatureUnlocked(char, featureId, true);
    }
    ui.notifications.info(t("Hub.UnlockedAll"));
    this.render();
  }

  static async #onDisableAllFeature(event, target) {
    event.preventDefault();
    const featureId = target.dataset.featureId;
    for (const char of registry.getManagedActors()) {
      await registry.setFeatureUnlocked(char, featureId, false);
    }
    ui.notifications.info(t("Hub.HiddenAll"));
    this.render();
  }
}
