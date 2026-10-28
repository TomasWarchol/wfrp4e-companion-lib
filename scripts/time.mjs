/**
 * Czas świata: Simple Calendar (jeśli aktywny) → wbudowany kalendarz Foundry (v13+) → surowe sekundy.
 */

const SECONDS_PER_DAY = 86400;

function simpleCalendar() {
  return globalThis.SimpleCalendar?.api ?? null;
}

function coreCalendar() {
  return game.time?.calendar?.timeToComponents ? game.time.calendar : null;
}

/** Bieżący znacznik czasu świata (sekundy). */
export function now() {
  try {
    const sc = simpleCalendar();
    if (sc?.getCurrentTimestamp) return sc.getCurrentTimestamp();
  } catch (e) {}
  return game.time?.worldTime || 0;
}

/** Liczba sekund w dniu według aktywnego kalendarza. */
export function secondsPerDay() {
  const days = coreCalendar()?.days;
  if (days?.secondsPerMinute && days?.minutesPerHour && days?.hoursPerDay) {
    return days.secondsPerMinute * days.minutesPerHour * days.hoursPerDay;
  }
  return SECONDS_PER_DAY;
}

/** Przesuwa znacznik czasu o podaną liczbę dni. */
export function addDays(timestamp, days) {
  return timestamp + (Number(days) || 0) * secondsPerDay();
}

/**
 * Składowe daty dla znacznika czasu.
 * @returns {{year: number, month: number, day: number, hour: number, monthName: string|null}}
 */
export function components(timestamp = now()) {
  try {
    const sc = simpleCalendar();
    if (sc?.timestampToDate) {
      const d = sc.timestampToDate(timestamp);
      if (d) return { year: d.year, month: d.month, day: d.day, hour: d.hour, monthName: d.monthName ?? null };
    }
  } catch (e) {}

  try {
    const calendar = coreCalendar();
    if (calendar) {
      const c = calendar.timeToComponents(timestamp);
      const monthName = calendar.months?.values?.[c.month]?.name;
      return { year: c.year, month: c.month, day: c.dayOfMonth, hour: c.hour, monthName: monthName ? game.i18n.localize(monthName) : null };
    }
  } catch (e) {}

  const perDay = SECONDS_PER_DAY;
  return { year: 0, month: 0, day: Math.floor(timestamp / perDay), hour: Math.floor((timestamp % perDay) / 3600), monthName: null };
}

/** Klucz dnia (do wykrywania zmiany dnia), np. "2512-3-14". */
export function dayKey(timestamp = now()) {
  const c = components(timestamp);
  return `${c.year}-${c.month}-${c.day}`;
}

/**
 * Data czytelna dla gracza.
 * @param {number} timestamp
 * @param {object} [options]
 * @param {string} [options.dayLabel]  Etykieta, gdy brak kalendarza (domyślnie „Day” z tłumaczeń)
 */
export function format(timestamp, { dayLabel = game.i18n.localize("WFRP4E_COMPANION.Day") } = {}) {
  if (!timestamp && timestamp !== 0) return "-";

  try {
    const sc = simpleCalendar();
    if (sc?.timestampToDate) {
      const scDate = sc.timestampToDate(timestamp);
      if (scDate) {
        const formatted = sc.formatDateTime?.(scDate);
        return formatted?.date || `${scDate.day} ${scDate.monthName} ${scDate.year}`;
      }
    }
  } catch (e) {}

  const c = components(timestamp);
  if (c.monthName) return `${c.day + 1} ${c.monthName} ${c.year}`;
  return `${dayLabel} ${Math.floor(timestamp / secondsPerDay()) + 1}`;
}
