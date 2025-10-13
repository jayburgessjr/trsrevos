"use client";

import "@shopify/polaris/build/esm/styles.css";
import en from "@shopify/polaris/locales/en.json";
import { AppProvider } from "@shopify/polaris";
import type { ReactNode } from "react";

export default function FormsLayout({ children }: { children: ReactNode }) {
  return <AppProvider i18n={en}>{children}</AppProvider>;
}
