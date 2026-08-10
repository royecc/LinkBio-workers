"use client";

import { useEffect } from "react";
import { Banner } from "@cloudflare/kumo/components/banner";
import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { FLASH_COOKIE } from "@/lib/flash-constants";

function clearFlashCookie() {
  try {
    document.cookie = `${FLASH_COOKIE}=; Path=/admin; Max-Age=0; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function Flash({ message }: { message?: string }) {
  useEffect(() => {
    if (message) clearFlashCookie();
  }, [message]);

  if (!message) return null;
  const isError = message.startsWith("error:");
  const text = isError
    ? message.slice(6)
    : message.startsWith("ok:")
      ? message.slice(3)
      : message;
  return (
    <Banner
      className="mb-4"
      size="sm"
      variant={isError ? "error" : "default"}
      icon={
        isError ? (
          <WarningCircleIcon weight="fill" className="size-4" />
        ) : (
          <CheckCircleIcon weight="fill" className="size-4" />
        )
      }
      title={text}
    />
  );
}
