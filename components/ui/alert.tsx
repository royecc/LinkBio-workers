import { cn } from "@/lib/utils";

export function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" | "success" }) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-3 py-2.5 text-sm",
        variant === "destructive" && "border-destructive/40 bg-destructive/10 text-destructive",
        variant === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        variant === "default" && "border-border bg-muted/40 text-foreground",
        className,
      )}
      {...props}
    />
  );
}
