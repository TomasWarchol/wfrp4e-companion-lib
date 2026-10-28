# WFRP4e – Companion Library (`wfrp4e-companion-lib`)

**English** | [Polski](README.pl.md)

Shared library for a series of **Foundry VTT v13–v14** modules for **Warhammer Fantasy Roleplay 4th Edition**:

* [WFRP4e – Old World Alchemy](https://github.com/TomasWarchol/wfrp4e-alchemy)
* [WFRP4e – Underworld Crew](https://github.com/TomasWarchol/wfrp4e-underworld)
* [WFRP4e – Iron Mandate: Champion](https://github.com/TomasWarchol/wfrp4e-champion)

It adds no game mechanics on its own. Foundry installs it automatically together with any module of the series.

The interface follows Foundry's language: **English** or **Polish** (any other language falls back to English).

## 📥 Installation

Usually installed as a dependency. To install it by hand, paste this into *Manifest URL* in **Add-on Modules → Install Module**:

```
https://github.com/TomasWarchol/wfrp4e-companion-lib/releases/latest/download/module.json
```

## 🧰 What it provides

* **GM's Companion Hub**: one window where the GM unlocks the series' features for each character. Open it with `/hub` (also `/gm`), the button in the Actors directory or the token toolbar.
* **Character sheet buttons** and **token toolbar tools** for the series' modules.
* **Safe GM queries**: players' actions that change other documents are carried out by the GM's client after a permission check.
* Dialog helpers, a calendar helper (Simple Calendar or Foundry's own calendar) and shared Handlebars helpers.

## 🔌 API

```javascript
const lib = game.modules.get("wfrp4e-companion-lib").api;
lib.openHub();                       // open the Companion Hub
lib.registry.isFeatureUnlocked(actor, "underworld");
```

Modules of the series import the library directly:

```javascript
import { registry, registerSheetButton } from "../wfrp4e-companion-lib/scripts/companion-lib.mjs";
```

---

Unofficial fan content, not affiliated with Games Workshop or Cubicle 7. Code under the [MIT licence](LICENSE).
