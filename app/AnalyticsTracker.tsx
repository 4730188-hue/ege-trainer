"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackClientEvent } from "@/lib/clientAnalytics";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (pathname.startsWith("/api")) return;
    if (pathname.startsWith("/go")) return;

    trackClientEvent("mini_app_open", {
      userAgent: navigator.userAgent,
    });
  }, [pathname]);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (pathname.startsWith("/api")) return;
    if (pathname.startsWith("/go")) return;

    trackClientEvent("page_view", {
      page: pathname,
    });
  }, [pathname]);

  return null;
}
