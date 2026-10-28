# WFRP4e – Companion Library (`wfrp4e-companion-lib`)

[English](README.md) | **Polski**

Biblioteka wspólna serii modułów do **Foundry VTT v13–v14** dla **Warhammer Fantasy Roleplay 4th Edition**:

* [WFRP4e – Alchemia Starego Świata (Old World Alchemy)](https://github.com/TomasWarchol/wfrp4e-alchemy)
* [WFRP4e – Szajka (Underworld Crew)](https://github.com/TomasWarchol/wfrp4e-underworld)
* [WFRP4e – Żelazny Mandat: Szampierz (Iron Mandate: Champion)](https://github.com/TomasWarchol/wfrp4e-champion)

Sama nie dodaje mechanik. Foundry instaluje ją automatycznie razem z dowolnym modułem serii.

Język interfejsu przełącza się razem z językiem Foundry (polski lub angielski; inne języki dostają angielski).

## 📥 Instalacja

Zwykle instaluje się jako zależność. Ręcznie: **Dodatki → Zainstaluj moduł**, w polu *Manifest URL* wklej:

```
https://github.com/TomasWarchol/wfrp4e-companion-lib/releases/latest/download/module.json
```

## 🧰 Co zawiera

* **Centrum Dodatków MG**: jedno okno, w którym MG odblokowuje funkcje serii dla postaci. Otwierasz je komendą `/hub` (także `/mg`, `/bajery`, `/dodatki`), przyciskiem w katalogu Aktorów albo na pasku tokenów.
* **Przyciski na kartach postaci** i **narzędzia paska tokenów** dla modułów serii.
* **Bezpieczne zapytania do MG**: akcje graczy zmieniające inne dokumenty wykonuje klient MG po sprawdzeniu uprawnień.
* Pomocniki okien dialogowych, kalendarza (Simple Calendar lub kalendarz Foundry) i wspólne pomocniki Handlebars.

## 🔌 API

```javascript
const lib = game.modules.get("wfrp4e-companion-lib").api;
lib.openHub();                       // Centrum Dodatków MG
lib.registry.isFeatureUnlocked(actor, "underworld");
```

---

Nieoficjalna twórczość fanowska, niezwiązana z Games Workshop ani Cubicle 7. Kod na [licencji MIT](LICENSE).
