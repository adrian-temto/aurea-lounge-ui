"use client";

import { useEffect, useState } from "react";

/**
 * Logo that leads back to the public site. The login lives on the admin subdomain
 * (lib/admin-host.ts), so "/" would stay on the admin host: drop the "admin." prefix instead.
 */
export function AuthLogo() {
  const [href, setHref] = useState("https://aurealounge.de/");
  useEffect(() => {
    const { protocol, hostname, port } = window.location;
    if (hostname.startsWith("admin."))
      setHref(`${protocol}//${hostname.slice("admin.".length)}${port ? `:${port}` : ""}/`);
  }, []);
  return (
    <a href={href} aria-label="Auréa" className="self-start">
      <img src="/logo.svg" alt="Auréa" width={645} height={167} className="h-10 w-auto" />
    </a>
  );
}
