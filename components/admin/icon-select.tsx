"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@cloudflare/kumo/components/button";
import { Label } from "@cloudflare/kumo/components/label";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import {
  listIcons,
  normalizeIconId,
  resolveLinkIconSrc,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

function IconGlyph({
  src,
  className,
  size = 20,
}: {
  src: string;
  className?: string;
  size?: number;
}) {
  const isRemote = /^https?:\/\//i.test(src);
  if (isRemote) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("object-contain opacity-90", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        width: size,
        height: size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

/**
 * Apply i18n template for unknown icons: "{id} (custom)" → "foo (custom)".
 * Must stay serializable — RSC cannot pass functions into Client Components.
 */
function applyCustomLabelTemplate(id: string, template?: string): string {
  if (!template) return id;
  return template.split("{id}").join(id);
}

type MenuPos = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
};

/**
 * Icon picker aligned with admin Kumo chrome.
 * Dropdown is portaled + fixed so it is not clipped by AdminPanel overflow.
 *
 * Props must be serializable (strings/objects). Do not pass functions from RSC.
 */
export function IconSelect({
  id,
  name = "icon",
  label,
  defaultValue = "link",
  /**
   * Translated template with `{id}` placeholder, e.g. t("admin.links.icon.custom").
   */
  customLabelTemplate,
  className,
}: {
  id?: string;
  name?: string;
  label: string;
  defaultValue?: string;
  customLabelTemplate?: string;
  className?: string;
}) {
  const autoId = useId();
  const fieldId = id || `icon-select-${autoId}`;
  const listboxId = `${fieldId}-listbox`;

  const initial = normalizeIconId(defaultValue || "link");
  const builtin = useMemo(() => listIcons(), []);
  const knownIds = useMemo(() => new Set(builtin.map((i) => i.id)), [builtin]);
  const isKnownInitial = knownIds.has(initial);

  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  type Option = { id: string; label: string; file: string };
  const options = useMemo((): Option[] => {
    const list: Option[] = builtin.map((i) => ({
      id: i.id,
      label: i.label,
      file: i.file,
    }));
    if (!isKnownInitial && initial) {
      list.unshift({
        id: initial,
        label: applyCustomLabelTemplate(initial, customLabelTemplate),
        file: resolveLinkIconSrc(initial),
      });
    }
    return list;
  }, [builtin, initial, isKnownInitial, customLabelTemplate]);

  const selected = options.find((o) => o.id === value) || options[0]!;
  const previewSrc = resolveLinkIconSrc(selected.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxH = 256;
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
    const spaceAbove = rect.top - gap - 8;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(maxH, openUp ? spaceAbove : spaceBelow));
    setMenuPos({
      top: openUp ? rect.top - gap : rect.bottom + gap,
      left: rect.left,
      width: Math.max(rect.width, 12 * 16),
      maxHeight,
      openUp,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    updateMenuPos();
    const onWin = () => updateMenuPos();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, updateMenuPos]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const listbox =
    open && mounted && menuPos
      ? createPortal(
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={label}
            className={cn(
              "fixed z-[200] overflow-auto rounded-lg",
              "border border-kumo-hairline bg-kumo-base p-1 shadow-lg ring ring-kumo-line",
            )}
            style={{
              left: menuPos.left,
              width: menuPos.width,
              maxHeight: menuPos.maxHeight,
              top: menuPos.openUp ? undefined : menuPos.top,
              bottom: menuPos.openUp
                ? Math.max(8, window.innerHeight - menuPos.top)
                : undefined,
            }}
          >
            {options.map((icon) => {
              const src = resolveLinkIconSrc(icon.id);
              const active = icon.id === value;
              return (
                <button
                  key={icon.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors",
                    "hover:bg-kumo-tint focus-visible:bg-kumo-tint focus-visible:outline-none",
                    active && "bg-kumo-tint font-medium text-kumo-strong",
                  )}
                  onClick={() => {
                    setValue(icon.id);
                    setOpen(false);
                  }}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md",
                      "bg-kumo-control text-kumo-default ring ring-kumo-hairline",
                    )}
                  >
                    <IconGlyph src={src} size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-kumo-default">{icon.label}</span>
                    <span className="block truncate font-mono text-[11px] text-kumo-subtle">
                      {icon.id}
                    </span>
                  </span>
                  {active ? (
                    <CheckIcon className="size-4 shrink-0 text-kumo-strong" weight="bold" />
                  ) : (
                    <span className="size-4 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative min-w-0 space-y-2", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <input type="hidden" name={name} value={value} />

      <div className="flex min-w-0 items-stretch gap-2">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg",
            "bg-kumo-control text-kumo-default ring ring-kumo-line",
          )}
          title={selected.label}
        >
          <IconGlyph src={previewSrc} size={22} className="text-kumo-strong" />
        </div>

        <div className="relative min-w-0 flex-1">
          <Button
            ref={triggerRef}
            id={fieldId}
            type="button"
            variant="secondary"
            className="h-11 w-full justify-between gap-2 px-3"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <IconGlyph src={previewSrc} size={16} className="text-kumo-default" />
              <span className="truncate text-left text-sm font-medium text-kumo-default">
                {selected.label}
              </span>
              <span className="truncate font-mono text-xs text-kumo-subtle">({selected.id})</span>
            </span>
            <CaretDownIcon
              className={cn(
                "size-4 shrink-0 text-kumo-subtle transition-transform",
                open && "rotate-180",
              )}
            />
          </Button>
        </div>
      </div>
      {listbox}
    </div>
  );
}
