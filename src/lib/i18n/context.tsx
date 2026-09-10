"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { en, type Dictionary } from "./locales/en";
import { es } from "./locales/es";
import { pt } from "./locales/pt";
import { fr } from "./locales/fr";
import { de } from "./locales/de";

export const LOCALES = ["en", "es", "pt", "fr", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
};

const DICTIONARIES: Record<Locale, Dictionary> = { en, es, pt, fr, de };

const STORAGE_KEY = "rebalancer-locale";

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Locale as an external store ([subscribe, getSnapshot, getServerSnapshot] -
 * see `useSyncExternalStore` below) rather than `useState` + a
 * detect-on-mount effect: the actual preference lives outside React,
 * in `localStorage`/`navigator.language`, so reading it is a
 * synchronization problem, not local component state - the same
 * distinction `set-targets-form.tsx` draws in its own "derived, not
 * stored" comment for a different case. This also gets SSR-safe
 * hydration for free: React renders `getServerSnapshot`'s "en" on the
 * server and during hydration, then re-renders with the real detected
 * locale immediately after - no homemade effect/setState flash, and no
 * `react-hooks/set-state-in-effect` violation from doing this by hand. */
let cachedLocale: Locale | null = null;
const listeners = new Set<() => void>();

function detectLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {
    // localStorage can throw in a private/blocked browsing context -
    // fall through to browser-language detection below.
  }
  for (const lang of navigator.languages ?? [navigator.language]) {
    const short = lang.slice(0, 2).toLowerCase();
    if (isLocale(short)) return short;
  }
  return "en";
}

function getSnapshot(): Locale {
  cachedLocale ??= detectLocale();
  return cachedLocale;
}

function getServerSnapshot(): Locale {
  return "en";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commitLocale(next: Locale) {
  cachedLocale = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Best-effort persistence only - a failed write just means the
    // choice doesn't survive a reload, not a broken switch.
  }
  listeners.forEach((listener) => listener());
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale: commitLocale, t: DICTIONARIES[locale] }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
