"use client";

import { useSyncExternalStore } from "react";

export const SERVICE_KEYS = ["unsure", "prototype", "custom", "team"] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];
const CHANGE_EVENT = "muyusoft:service-selection";

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("popstate", callback);
  };
}

function readSelection(): ServiceKey {
  const value = new URLSearchParams(window.location.search).get("service");
  return SERVICE_KEYS.find((key) => key === value) ?? "unsure";
}

export function selectService(service: ServiceKey, navigate = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("service", service);
  if (navigate) url.hash = "contact";
  if (navigate) window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useSelectedService() {
  return useSyncExternalStore(subscribe, readSelection, () => "unsure" as ServiceKey);
}
