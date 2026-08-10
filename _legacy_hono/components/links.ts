import { escapeHtml } from "../middleware/security";
import type { LinkItem } from "../types";
import { iconSvg } from "./icons";

export function renderLinks(links: LinkItem[], emptyLabel = "No links yet.", navLabel = "Links"): string {
  const enabled = links.filter((l) => l.enabled && l.url).sort((a, b) => a.order - b.order);
  if (!enabled.length) {
    return `<div class="empty">${escapeHtml(emptyLabel)}</div>`;
  }

  const items = enabled
    .map((link) => {
      const title = escapeHtml(link.title);
      const url = escapeHtml(link.url);
      const icon = iconSvg(link.icon);
      return `<a class="link-btn" href="${url}" rel="noopener noreferrer" target="_blank" data-link-id="${escapeHtml(link.id)}">
        ${icon}
        <span>${title}</span>
      </a>`;
    })
    .join("\n");

  return `<nav class="links" aria-label="${escapeHtml(navLabel)}">${items}</nav>`;
}
