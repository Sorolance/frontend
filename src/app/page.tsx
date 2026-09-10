"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/i18n/context";

export default function Home() {
  const { t } = useLocale();

  return (
    <div className="flex flex-1 flex-col px-6">
      <div className="flex justify-end pt-6">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="mb-3 text-sm font-medium text-muted">{t.home.kicker}</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {t.home.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">{t.home.description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/app"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
          >
            {t.nav.openDashboard}
          </Link>
          <Link
            href="/demo"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-surface-raised"
          >
            {t.nav.tryDemo}
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted">{t.home.testnetNotice}</p>
      </div>
    </div>
  );
}
