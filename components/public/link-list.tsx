"use client";

import type { LinkItem } from "@/lib/types";
import { resolveLinkIconSrc } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export function LinkList({
  links,
  emptyLabel,
}: {
  links: LinkItem[];
  emptyLabel: string;
}) {
  const enabled = links
    .filter((l) => l.enabled && l.url)
    .sort((a, b) => a.order - b.order);

  if (!enabled.length) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <nav className="theme-links w-full min-w-0" aria-label="Links">
      {enabled.map((link) => {
        const src = resolveLinkIconSrc(link.icon);
        const isRemote = /^https?:\/\//i.test((link.icon || "").trim());
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            data-link-id={link.id}
            onClick={() => {
              try {
                navigator.sendBeacon("/api/click", JSON.stringify({ id: link.id }));
              } catch {
                void fetch("/api/click", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: link.id }),
                  keepalive: true,
                });
              }
            }}
            className={cn(
              "theme-link group flex items-center gap-3 border border-border bg-card/80 px-4 py-3.5",
              "text-sm font-medium shadow-sm transition",
              "hover:border-primary/40 hover:bg-card hover:shadow-md",
            )}
          >
            {isRemote ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                width={20}
                height={20}
                className="theme-link-icon h-5 w-5 shrink-0 rounded-sm object-contain opacity-80"
                loading="lazy"
              />
            ) : (
              <span
                aria-hidden
                className="theme-link-icon inline-block h-5 w-5 shrink-0 bg-current opacity-80 group-hover:text-primary"
                style={{
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
            )}
            <span className="flex-1 truncate text-left">{link.title}</span>
            <ExternalLink className="theme-link-external h-4 w-4 opacity-40" />
          </a>
        );
      })}
    </nav>
  );
}
