import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProfileCard({ profile }: { profile: Profile }) {
  const initial = (profile.name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="theme-profile flex w-full min-w-0 max-w-full flex-col items-center gap-3 text-center">
      <div className="relative">
        {profile.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar}
            alt=""
            className="theme-avatar h-24 w-24 rounded-full border-2 border-border object-cover shadow-xl"
          />
        ) : (
          <div
            className={cn(
              "theme-avatar theme-avatar-fallback flex h-24 w-24 items-center justify-center rounded-full border-2 border-border",
              "bg-muted text-2xl font-semibold text-muted-foreground shadow-xl",
            )}
          >
            {initial}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
        {profile.username ? (
          <p className="theme-username text-sm text-muted-foreground">@{profile.username}</p>
        ) : null}
      </div>
      {profile.bio ? (
        <p className="theme-bio max-w-sm text-sm leading-relaxed text-muted-foreground">
          {profile.bio}
        </p>
      ) : null}
      <div className="theme-meta flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        {profile.location ? <span>{profile.location}</span> : null}
        {profile.email ? (
          <a className="hover:text-foreground" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        ) : null}
      </div>
    </div>
  );
}
