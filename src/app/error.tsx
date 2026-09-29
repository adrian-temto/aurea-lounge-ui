"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useI18n } from "@/i18n/client";
import { reportLovableError } from "@/lib/lovable-error-reporting";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t, href } = useI18n();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "next_root_error_boundary" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{t.error.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.error.text}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.error.retry}
          </button>
          <Link
            href={href("/")}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t.error.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
