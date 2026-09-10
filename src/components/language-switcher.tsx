"use client";

import { LOCALES, LOCALE_NAMES, useLocale, type Locale } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <select
      aria-label={t.common.language}
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="rounded-full border border-border bg-transparent px-3 py-2 text-sm"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_NAMES[l]}
        </option>
      ))}
    </select>
  );
}
