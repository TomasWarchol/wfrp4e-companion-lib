/**
 * Wspólne helpery Handlebars serii. Wszystkie mają prefiks "bajery", aby nie kolidować
 * z helperami systemu ani innych modułów.
 */

export function registerHandlebarsHelpers() {
  const helpers = {
    bajeryEq: (a, b) => a === b,
    bajeryGt: (a, b) => a > b,
    bajeryGte: (a, b) => a >= b,
    bajeryLt: (a, b) => a < b,
    bajeryIncludes: (array, value) => Array.isArray(array) && array.includes(value),
    bajeryMultiply: (a, b) => Number(a) * Number(b),
    bajeryDivide: (a, b) => (Number(b) !== 0 ? Number(a) / Number(b) : 0),
    bajeryCapitalize: (str) => (typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : ""),
    bajeryConcat: (...args) => args.slice(0, -1).join(""),

    /** {{#bajeryTimes 5}}…{{/bajeryTimes}} – powtarza blok n razy (@index dostępny jako this). */
    bajeryTimes(n, block) {
      let accum = "";
      const count = parseInt(n, 10) || 0;
      for (let i = 0; i < count; ++i) accum += block.fn(i);
      return accum;
    },

    /** {{#bajerySelect value}}<option…>{{/bajerySelect}} – zaznacza opcję o podanej wartości. */
    bajerySelect(selected, options) {
      const escaped = String(selected ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const html = options.fn(this);
      return html.replace(new RegExp(`value=["']${escaped}["']`), "$& selected");
    }
  };

  for (const [name, fn] of Object.entries(helpers)) Handlebars.registerHelper(name, fn);
}
