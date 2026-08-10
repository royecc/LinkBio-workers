import { escapeHtml } from "../middleware/security";
import type { Profile } from "../types";

export function renderProfileBlock(profile: Profile): string {
  const name = escapeHtml(profile.name);
  const username = escapeHtml(profile.username);
  const bio = escapeHtml(profile.bio);
  const location = escapeHtml(profile.location);
  const email = escapeHtml(profile.email);
  const avatar = escapeHtml(profile.avatar);

  const initial = escapeHtml((profile.name || "?").trim().charAt(0).toUpperCase() || "?");

  const avatarHtml = profile.avatar
    ? `<img class="avatar" src="${avatar}" alt="${name}" width="96" height="96" loading="eager" />`
    : `<div class="avatar-fallback" aria-hidden="true">${initial}</div>`;

  const metaParts: string[] = [];
  if (profile.location) {
    metaParts.push(
      `<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>${location}</span>`,
    );
  }
  if (profile.email) {
    metaParts.push(
      `<span><a href="mailto:${email}">${email}</a></span>`,
    );
  }

  return `
  <div class="avatar-wrap">${avatarHtml}</div>
  <div class="profile">
    <h1>${name}</h1>
    ${username ? `<div class="username">@${username}</div>` : ""}
    ${bio ? `<p class="bio">${bio}</p>` : ""}
    ${metaParts.length ? `<div class="meta">${metaParts.join("")}</div>` : ""}
  </div>`;
}
