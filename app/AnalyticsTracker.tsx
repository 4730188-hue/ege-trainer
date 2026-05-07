"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackClientEvent } from "@/lib/clientAnalytics";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackClientEvent("mini_app_open", {
      userAgent: navigator.userAgent,
    });
  }, []);

  useEffect(() => {
    if (!pathname) return;

    trackClientEvent("page_view", {
      page: pathname,
    });
  }, [pathname]);

  return null;
}
