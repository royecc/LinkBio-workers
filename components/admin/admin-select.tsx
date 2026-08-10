"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@cloudflare/kumo/components/button";
import { Label } from "@cloudflare/kumo/components/label";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type AdminSelectOption = {
  value: string;
  label: string;
  /** Optional secondary line (serializable) */
  description?: string;
};

type MenuPos = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
};

/**
 * Admin list select — same chrome language as IconSelect:
 * Kumo secondary trigger, portaled fixed listbox (escapes AdminPanel overflow).
 * Props must be serializable (RSC-safe).
 */
export function AdminSelect({
  id,
  name,
  label,
  defaultValue,
  options,
  description,
  className,
  placeholder,
}: {
  id?: string;
  name: string;
  label: string;
  defaultValue?: string;
  options: AdminSelectOption[];
  /** Field help text under the control */
  description?: string;
  className?: string;
  placeholder?: string;
}) {
  const autoId = useId();
  const fieldId = id || `admin-select-${autoId}`;
  const listboxId = `${fieldId}-listbox`;

  const initial =
    options.find((o) => o.value === defaultValue)?.value ?? options[0]?.value ?? "";
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];
  const displayLabel = selected?.label || placeholder || value;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxH = 280;
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
    const spaceAbove = rect.top - gap - 8;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(maxH, openUp ? spaceAbove : spaceBelow));
    setMenuPos({
      top: openUp ? rect.top - gap : rect.bottom + gap,
      left: rect.left,
      width: Math.max(rect.width, 10 * 16),
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
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    "hover:bg-kumo-tint focus-visible:bg-kumo-tint focus-visible:outline-none",
                    active && "bg-kumo-tint font-medium text-kumo-strong",
                  )}
                  onClick={() => {
                    setValue(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-kumo-default">{opt.label}</span>
                    {opt.description ? (
                      <span className="mt-0.5 block text-xs leading-snug text-kumo-subtle">
                        {opt.description}
                      </span>
                    ) : null}
                  </span>
                  {active ? (
                    <CheckIcon
                      className="mt-0.5 size-4 shrink-0 text-kumo-strong"
                      weight="bold"
                    />
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
        <span className="min-w-0 truncate text-left text-sm font-medium text-kumo-default">
          {displayLabel}
        </span>
        <CaretDownIcon
          className={cn(
            "size-4 shrink-0 text-kumo-subtle transition-transform",
            open && "rotate-180",
          )}
        />
      </Button>
      {description ? (
        <p className="text-xs text-kumo-subtle">{description}</p>
      ) : null}
      {listbox}
    </div>
  );
}
