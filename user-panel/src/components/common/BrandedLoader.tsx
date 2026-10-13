import { AppLogo } from "./AppLogo";

type BrandedLoaderProps = {
  message?: string;
  fullScreen?: boolean;
  className?: string;
};

export function BrandedLoader({
  message = "Loading your workspace...",
  fullScreen = false,
  className = "",
}: BrandedLoaderProps) {
  return (
    <div
      className={`${
        fullScreen
          ? "min-h-screen bg-background"
          : "min-h-[320px] rounded-2xl border border-border-light bg-background-elevated"
      } flex w-full items-center justify-center px-6 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute -inset-5 rounded-full bg-primary/10 animate-pulse" />
          <div className="absolute -inset-3 rounded-full border border-primary/20" />
          <div className="relative rounded-2xl border border-border-light bg-white px-5 py-3 shadow-lg shadow-primary/10">
            <AppLogo size="lg" showText={false} to="" />
          </div>
        </div>

        <p className="text-sm font-bold tracking-wide text-foreground">ACP Courier Speed</p>
        <p className="mt-1 text-xs text-muted">{message}</p>

        <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${dot * 140}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
