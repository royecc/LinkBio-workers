"use client";

import { Button } from "@cloudflare/kumo/components/button";
import type { ComponentProps } from "react";

/**
 * Destructive/submit button with optional browser confirm dialog.
 * Client-only so onClick works with Server Action forms.
 */
export function ConfirmSubmitButton({
  confirmMessage,
  children,
  ...props
}: ComponentProps<typeof Button> & {
  confirmMessage?: string;
}) {
  return (
    <Button
      type="submit"
      {...props}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
        }
        props.onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
}
