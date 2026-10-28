import { t } from "./constants.mjs";

/**
 * Zapytania między klientami przez CONFIG.queries (Foundry v13+).
 * W odróżnieniu od surowego game.socket nadawcę (context.user) ustala serwer, więc nie da się go podrobić.
 */

/**
 * Rejestruje handler zapytania. Wołać w hooku "init" lub wcześniej.
 * @param {string} name  Nazwa z prefiksem modułu, np. "wfrp4e-alchemy.severTether"
 * @param {(data: object, context: {user: User}) => any} handler
 */
export function registerQuery(name, handler) {
  CONFIG.queries[name] = handler;
}

/**
 * Wysyła zapytanie do aktywnego MG i zwraca jego wynik.
 * Gdy bieżący użytkownik jest aktywnym MG, handler wykonuje się lokalnie.
 * @param {string} name
 * @param {object} data
 * @param {object} [options]
 * @param {number} [options.timeout]
 */
export async function queryGM(name, data = {}, { timeout } = {}) {
  const gm = game.users.activeGM;
  if (!gm) {
    ui.notifications.warn(t("NeedsGM"));
    return null;
  }
  if (gm.isSelf) return CONFIG.queries[name](data, { user: game.user });
  return gm.query(name, data, { timeout });
}

/**
 * Powiadamia wskazanych aktywnych użytkowników (bez czekania na wynik).
 * Bieżący użytkownik obsługuje zapytanie lokalnie.
 * @param {Iterable<User>} users
 * @param {string} name
 * @param {object} data
 */
export function notifyUsers(users, name, data = {}) {
  for (const user of users) {
    if (!user?.active) continue;
    if (user.isSelf) {
      Promise.resolve(CONFIG.queries[name](data, { user: game.user })).catch(err => console.error(err));
    } else {
      user.query(name, data).catch(err => console.warn(t("QueryFailed", { name, user: user.name }), err));
    }
  }
}
