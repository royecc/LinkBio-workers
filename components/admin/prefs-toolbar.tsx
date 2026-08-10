"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@cloudflare/kumo/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColorMode } from "@/lib/types";
import type { LocalePref } from "@/lib/prefs";
import { COLOR_COOKIE, COLOR_STORAGE_KEY, LOCALE_COOKIE } from "@/lib/prefs";
import { cn } from "@/lib/utils";

type Labels = {
  color: string;
  system: string;
  light: string;
  dark: string;
  locale: string;
  auto: string;
  zh: string;
  en: string;
};

const YEAR = 31536000;

function setCookie(name: string, value: string) {
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  let s = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${YEAR}; SameSite=Lax`;
  if (secure) s += "; Secure";
  document.cookie = s;
}

function applyColor(mode: ColorMode) {
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.classList.toggle("light", mode === "light");
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.setAttribute("content", mode === "system" ? "light dark" : mode);

  // Sync Kumo admin shell data-mode
  const root = document.querySelector<HTMLElement>("[data-admin-root]");
  if (root) {
    if (mode === "system") {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-mode", dark ? "dark" : "light");
    } else {
      root.setAttribute("data-mode", mode);
    }
  }

  try {
    localStorage.setItem(COLOR_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  setCookie(COLOR_COOKIE, mode);
}

const triggerClass = cn(
  "size-9 shrink-0 rounded-full p-0",
  "inline-flex items-center justify-center",
);

/**
 * Same prefs as public ThemeToolbar (cookie + refresh), styled for admin / Kumo.
 */
export function AdminPrefsToolbar({
  colorMode,
  localePref,
  labels,
}: {
  colorMode: ColorMode;
  localePref: LocalePref;
  labels: Labels;
}) {
  const router = useRouter();
  const colorLabel =
    colorMode === "light" ? labels.light : colorMode === "dark" ? labels.dark : labels.system;
  const localeShort = localePref === "zh-CN" ? "中" : localePref === "en" ? "EN" : "A";
  const localeLabel =
    localePref === "zh-CN" ? labels.zh : localePref === "en" ? labels.en : labels.auto;
  const ColorIcon = colorMode === "light" ? Sun : colorMode === "dark" ? Moon : Monitor;

  return (
    <aside className="admin-prefs-toolbar" aria-label={`${labels.color} / ${labels.locale}`}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className={triggerClass}
            aria-label={`${labels.color}: ${colorLabel}`}
            title={`${labels.color}: ${colorLabel}`}
          >
            <ColorIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[70] min-w-[9.5rem]"
        >
          <DropdownMenuLabel>{labels.color}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(
            [
              ["system", labels.system],
              ["light", labels.light],
              ["dark", labels.dark],
            ] as const
          ).map(([value, label]) => (
            <DropdownMenuItem
              key={value}
              className={cn(colorMode === value && "font-semibold text-primary")}
              onSelect={() => {
                applyColor(value);
                router.refresh();
              }}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className={triggerClass}
            aria-label={`${labels.locale}: ${localeLabel}`}
            title={`${labels.locale}: ${localeLabel}`}
          >
            <span className="text-[11px] font-bold leading-none tracking-tight">{localeShort}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[70] min-w-[9.5rem]"
        >
          <DropdownMenuLabel>{labels.locale}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(
            [
              ["auto", labels.auto],
              ["zh-CN", labels.zh],
              ["en", labels.en],
            ] as const
          ).map(([value, label]) => (
            <DropdownMenuItem
              key={value}
              className={cn(localePref === value && "font-semibold text-primary")}
              onSelect={() => {
                setCookie(LOCALE_COOKIE, value);
                router.refresh();
              }}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
